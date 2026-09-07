/** Explicit artifact locations. Inclusion here is a work inventory, NOT a completion declaration. */
export const TEXAS_COMPLETION_COURSES = Object.freeze([
  ["law-of-contracts", "Law of Contracts", "LOC"],
  ["promulgated-contract-forms", "Promulgated Contract Forms", "PCF"],
  ["real-estate-finance", "Real Estate Finance", "REF"],
].map(([slug, title, prefix]) => Object.freeze({
  slug, title, prefix,
  courseId: `tx-${slug}-30-v1`,
  catalogCourseId: `tx-${slug}-30`,
  directory: `texas/tx-${slug}-30-v1`,
  curriculumDir: `texas/tx-${slug}-30-v1/curriculum`,
  outlinePath: `config/texas/${slug}-course-form.mjs`,
  coursePath: `config/texas/${slug}-course.mjs`,
  questionBankPath: `config/texas/${slug}-question-bank.mjs`,
  scenarioPath: `config/texas/${slug}-scenarios.mjs`,
  misconceptionPath: `config/texas/${slug}-misconception-checks.mjs`,
  finalBankPath: `config/texas/${slug}-final-exam-bank.mjs`,
  finalFormsPath: `config/texas/${slug}-final-exam-forms.mjs`,
})));

export const TEXAS_COMPLETION_GATES = Object.freeze({
  enrollmentEnabled: false,
  paymentEnabled: false,
  creditReportingEnabled: false,
  certificateIssuanceEnabled: false,
  finalExaminationAdministrable: false,
  trecApprovalStatus: "NOT_SUBMITTED_NOT_APPROVED",
});
