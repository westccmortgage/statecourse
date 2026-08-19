const bool = (name, fallback = false) => {
  const value = process.env[name];
  if (value == null || value === "") return fallback;
  return value.toLowerCase() === "true";
};

const cents = (name) => {
  const value = process.env[name];
  if (!value) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

function configuredCourse({ id, state, name, productType = "real_estate_prelicense", env, versions }) {
  return {
    id,
    state,
    name,
    productType,
    currency: "usd",
    /* The suffix every STATECOURSE_* variable for this course is built from. Exposed rather
       than left implicit because tooling has to print the exact variable names an operator
       must set, and a tool that recomputes them from the course id gets a different answer
       — `ca-real-estate-principles-45` is not `CA_PRINCIPLES_45`. One source, no drift. */
    envKey: env,
    approvalStatus: process.env[`STATECOURSE_${env}_APPROVAL_STATUS`] || "submission_draft",
    enrollmentEnabled: bool(`STATECOURSE_${env}_ENROLLMENT_ENABLED`),
    price: {
      test: cents(`STATECOURSE_PRICE_${env}_TEST_CENTS`),
      live: cents(`STATECOURSE_PRICE_${env}_LIVE_CENTS`),
    },
    versions: {
      regulatoryAcknowledgment: versions.regulatory,
      terms: "statecourse-terms-v1",
      refundPolicy: versions.refund,
      cancellationPolicy: versions.cancellation,
    },
  };
}

const courses = Object.fromEntries([
  configuredCourse({
    id:"me-sales-agent", state:"ME", name:"Maine Real Estate Sales Agent Pre-License Course", env:"ME_SALES_AGENT",
    versions:{ regulatory:"me-sales-agent-regulatory-draft-v1", refund:"me-sales-agent-refund-pending-review-v1", cancellation:"me-sales-agent-cancellation-pending-review-v1" },
  }),
  configuredCourse({
    id:"va-salesperson", state:"VA", name:"Virginia Principles and Practices of Real Estate", env:"VA_SALESPERSON",
    versions:{ regulatory:"va-salesperson-regulatory-draft-v1", refund:"va-salesperson-refund-pending-review-v1", cancellation:"va-salesperson-cancellation-pending-review-v1" },
  }),
  configuredCourse({
    id:"wi-salesperson", state:"WI", name:"Wisconsin Salesperson Pre-License — 72 Hours", env:"WI_SALESPERSON",
    versions:{ regulatory:"wi-salesperson-regulatory-draft-v1", refund:"wi-salesperson-refund-pending-review-v1", cancellation:"wi-salesperson-cancellation-pending-review-v1" },
  }),
  configuredCourse({
    id:"mo-salesperson-preexam-48", state:"MO", name:"Missouri Salesperson Pre-Exam Course — 48 Hours", env:"MO_PREEXAM_48",
    versions:{ regulatory:"mo-preexam-48-regulatory-draft-v1", refund:"mo-preexam-48-refund-pending-review-v1", cancellation:"mo-preexam-48-cancellation-pending-review-v1" },
  }),
  configuredCourse({
    id:"mo-real-estate-practice-24", state:"MO", name:"Missouri Real Estate Practice Course — 24 Hours", env:"MO_PRACTICE_24",
    versions:{ regulatory:"mo-practice-24-regulatory-draft-v1", refund:"mo-practice-24-refund-pending-review-v1", cancellation:"mo-practice-24-cancellation-pending-review-v1" },
  }),
  configuredCourse({
    id:"ok-basic-prelicense-90", state:"OK", name:"Oklahoma Basic Pre-License Course — 90 Hours", env:"OK_BASIC_90",
    versions:{ regulatory:"ok-basic-90-regulatory-draft-v1", refund:"ok-basic-90-refund-pending-review-v1", cancellation:"ok-basic-90-cancellation-pending-review-v1" },
  }),
  configuredCourse({
    id:"ca-real-estate-principles-45", state:"CA", name:"California Real Estate Principles — 45 Hours", env:"CA_PRINCIPLES_45",
    versions:{ regulatory:"ca-real-estate-principles-45-regulatory-draft-v1", refund:"ca-real-estate-principles-45-refund-pending-review-v1", cancellation:"ca-real-estate-principles-45-cancellation-pending-review-v1" },
  }),
  configuredCourse({
    id:"ca-real-estate-practice-45", state:"CA", name:"California Real Estate Practice — 45 Hours", env:"CA_PRACTICE_45",
    versions:{ regulatory:"ca-real-estate-practice-45-regulatory-draft-v1", refund:"ca-real-estate-practice-45-refund-pending-review-v1", cancellation:"ca-real-estate-practice-45-cancellation-pending-review-v1" },
  }),
  configuredCourse({
    id:"ca-mortgage-loan-brokering-lending-45", state:"CA", name:"California Mortgage Loan Brokering and Lending — 45 Hours", env:"CA_MORTGAGE_45",
    versions:{ regulatory:"ca-mortgage-loan-brokering-lending-45-regulatory-draft-v1", refund:"ca-mortgage-loan-brokering-lending-45-refund-pending-review-v1", cancellation:"ca-mortgage-loan-brokering-lending-45-cancellation-pending-review-v1" },
  }),
].map((course) => [course.id, course]));

export function getCourse(courseId) {
  return courses[courseId] || null;
}

export function getCourseCatalog() {
  return Object.values(courses);
}

export function evaluateCheckoutEligibility(course, mode) {
  if (!course) return { allowed: false, reason: "unknown_course" };
  if (!course.price[mode]) return { allowed: false, reason: "price_not_configured" };

  if (mode === "live") {
    if (process.env.STATECOURSE_LIVE_PAYMENTS_ENABLED !== "true") return { allowed: false, reason: "live_payments_disabled" };
    if (course.approvalStatus !== "approved") return { allowed: false, reason: "course_not_approved" };
    if (!course.enrollmentEnabled) return { allowed: false, reason: "enrollment_disabled" };
    return { allowed: true, qaOnly: false };
  }

  if (course.approvalStatus !== "approved" || !course.enrollmentEnabled) {
    if (process.env.STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES !== "true") {
      return { allowed: false, reason: "sandbox_draft_testing_disabled" };
    }
  }
  return { allowed: true, qaOnly: true };
}

