/**
 * The single source of every fact that appears on more than one California DRE document.
 *
 * The submission is three applications, sixteen documents each, plus an administrative
 * section. A number stated one way on RE 306 and another way on RE 313 is a deficiency
 * letter, and there is no way to keep dozens of hand-written documents agreeing with each
 * other by care alone. So every shared fact lives here once, the generator reads it, and
 * `tests/california-submission-consistency.test.mjs` fails the build if any document
 * disagrees with it.
 *
 * NOTHING in this file may assert approval. No sponsor id, no course approval number, no
 * "approved instructor". Those are DRE's to assign, and the fields stay null until it does.
 */

export const PROVIDER = Object.freeze({
  legalName: "StateCourse LLC",
  entityType: "California domestic limited liability company",
  secretaryOfStateFileNumber: "B20260376786",
  secretaryOfStateFiledOn: "August 18, 2026",
  principalOffice: Object.freeze({
    street: "150 E Olive Avenue, Suite 112",
    city: "Burbank",
    state: "CA",
    zip: "91502"
  }),
  mailingAddress: Object.freeze({
    street: "407 N Pacific Coast Highway, Unit 1028",
    city: "Redondo Beach",
    state: "CA",
    zip: "90277"
  }),
  website: "https://statecourse.com",
  phone: "(310) 686-5053",
  publicEmail: "info@statecourse.com",
  /* Decided 2026-08-20: trade publicly under the full legal name, so "StateCourse" is never
     used as a business name and no fictitious business name statement is required. See
     california/submission/00_administrative/A5-fbns-determination.md, Option A.
     RE 306 item 2 is therefore blank and item 10 is NO. */
  fictitiousBusinessName: null,
  tradingName: "StateCourse LLC",
  /* Assigned by DRE on approval. Never invented, never guessed, never filled with a
     placeholder that could be mistaken for real. */
  dreSponsorId: null
});

/* What a student pays. RE 313's fee field asks for the total "INCLUDING ANY SHIPPING AND
   HANDLING FEES, COURSE GROUP PACKAGE FEES, DISCOUNTS ETC.", so the package prices are
   disclosed on every course's General Information Page, not only the single-course price.

   Note what these names deliberately do NOT say. No product name or description may call a
   course "DRE-approved" until DRE has approved it; doing so would be a false statement to
   consumers and a Regulation 3000(a)(5) advertising violation. */
export const PRICING = Object.freeze({
  singleCourse: Object.freeze({
    name: "Individual California Course — 45 Hours",
    usd: 79,
    cents: 7900,
    includes: "Any one of the three California statutory pre-license courses."
  }),
  requiredEducation: Object.freeze({
    name: "California Required Education — 135 Hours",
    usd: 199,
    cents: 19900,
    includes: "All three courses: Real Estate Principles, Real Estate Practice, and Mortgage Loan Brokering and Lending."
  }),
  completePath: Object.freeze({
    name: "California Complete Licensing Path",
    usd: 299,
    cents: 29900,
    includes: "All 135 hours, plus California Exam Prep and the Licensing/Application Navigator."
  }),
  /* Required by RE 313 and not yet decided. It must be the same policy version the
     enrollment flow presents and records; inventing one here would put a DRE-filed document
     at odds with what a student actually agrees to. */
  refundPolicy: null
});

export const INSTRUCTOR = Object.freeze({
  name: "Anatoliy Kanevsky",
  nameLastFirst: "Kanevsky, Anatoliy",
  dreBrokerLicense: "01385024",
  /* The only accurate statement of status until DRE says otherwise. */
  approvalStatus: "Instructor approval pending DRE review"
});

/* Regulation 3000(a)(1): a correspondence course consists of not fewer than 15 separate
   lesson assignments. 15 x 180 minutes = 2,700 minutes = 45 hours. */
export const COURSE_DESIGN = Object.freeze({
  hours: 45,
  lessonAssignments: 15,
  minutesPerAssignment: 180,
  totalInstructionalMinutes: 2700,
  /* RE 306 item 15A wording, and the RE 313 "method of course presentation" wording. */
  methodOfPresentation: "Correspondence/Independent Study, Internet",
  re306_15A: "CORRESPONDENCE AND INTERNET",
  /* RE 306 item 15B and RE 313 "method of final exam presentation". Both boxes are checked:
     the examination is delivered over the internet AND supervised in person by a
     school-designated proctor, which Regulation 3000(a)(2)(B) requires of a correspondence
     course. */
  re306_15B: ["IN PERSON PROCTORED", "INTERNET"],
  re306_15B_notChecked: ["MOBILE DEVICE APP"],
  /* RE 311 course-type checkbox. */
  re311CourseType: "CORRESPONDENCE/INTERNET"
});

export const FINAL_EXAM = Object.freeze({
  questions: 100,
  questionType: "Multiple choice",
  minutes: 180,
  passingPercent: 60,
  openOrClosedBook: "Closed book",
  attemptsAllowed: 2,
  attemptsWording: "One original examination and one retake on a different examination form",
  forms: ["Form A", "Form B"],
  proctored: true,
  proctorRule: "Regulation 3000(a)(2)(B)"
});

/* RE 303, page 3. Both RE 303 and the RE 313 boilerplate state 2½ weeks. */
export const ENROLLMENT_RULES = Object.freeze({
  minimumSingleCourseCompletion: "2½ weeks",
  twoCourseWindow: "No more than two courses may be completed in a five-week period",
  completionDeadline: "One year from the date of registration",
  certificateDeliveryDays: 15,
  certificateDeliveryAuthority: "Regulation 3000(a)(6)"
});

export const COURSES = Object.freeze([
  Object.freeze({
    order: "01",
    packageDir: "01_Real_Estate_Principles",
    courseId: "ca-real-estate-principles-45-v1",
    title: "Real Estate Principles",
    catalogId: "ca-real-estate-principles-45",
    interactiveParticipatory: false,
    description:
      "A 45-hour statutory pre-license course covering the fundamentals of California real "
      + "estate: the profession and its regulatory structure, property rights and estates, "
      + "agency, contracts, financing, appraisal, land use, taxation, and the licensing "
      + "and disclosure obligations of a California licensee."
  }),
  Object.freeze({
    order: "02",
    packageDir: "02_Real_Estate_Practice",
    courseId: "ca-real-estate-practice-45-v1",
    title: "Real Estate Practice",
    catalogId: "ca-real-estate-practice-45",
    /* RE 306 item 23A: all real estate practice courses are required to have one. */
    interactiveParticipatory: true,
    description:
      "A 45-hour statutory pre-license course covering the day-to-day practice of real "
      + "estate in California: prospecting, listing, advertising, showing, offers and "
      + "negotiation, escrow and closing, trust fund handling, property management, risk "
      + "management, and fair housing — delivered with a required interactive "
      + "participatory component in every lesson assignment."
  }),
  Object.freeze({
    order: "03",
    packageDir: "03_Mortgage_Loan_Brokering_and_Lending",
    courseId: "ca-mortgage-loan-brokering-lending-45-v1",
    title: "Mortgage Loan Brokering and Lending",
    catalogId: "ca-mortgage-loan-brokering-lending-45",
    interactiveParticipatory: false,
    description:
      "A 45-hour statutory pre-license course covering mortgage loan brokering and lending "
      + "in California: loan products and underwriting, the primary and secondary markets, "
      + "federal disclosure law, California mortgage lending law and licensing, loan "
      + "processing and closing, and the fiduciary and disclosure duties of a mortgage "
      + "loan broker."
  })
]);

export const FEES = Object.freeze({
  perCourse: 500,
  currency: "USD",
  courseCount: 3,
  total: 1500,
  authority: "RE 206E, Course Application Fees — Prelicense Course $500",
  payableTo: "Department of Real Estate",
  methods: ["Cashier's check", "Money order", "Check", "Credit card via RE 909"],
  doNotSend: "Cash",
  nonRefundable: true
});

export const DRE = Object.freeze({
  section: "Education and Research Section",
  department: "Department of Real Estate",
  street: "651 Bannon Street, Suite 504",
  city: "Sacramento",
  state: "CA",
  zip: "95811",
  phone: "(916) 576-3366",
  fax: "(916) 263-8758",
  reviewDays: 60,
  reviewNote: "Pre-license/Statutory course submissions require 60 days for review"
});

/* Phrases that must never appear in a StateCourse document until DRE has approved in
   writing. The consistency test greps for every one of them. */
export const FORBIDDEN_CLAIMS = Object.freeze([
  "DRE Approved",
  "DRE-Approved",
  "State Approved",
  "State-Approved",
  "approved provider",
  "approved instructor",
  "approved by the Department of Real Estate",
  "regulatory credit is available"
]);

export const STATUS_LINE =
  "Submission draft. This course is not approved by the California Department of Real Estate, "
  + "no course approval number has been issued, and no California pre-license credit is "
  + "available for it.";
