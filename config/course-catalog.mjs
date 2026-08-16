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

const courses = {
  "me-sales-agent": {
    id: "me-sales-agent",
    state: "ME",
    name: "Maine Real Estate Sales Agent Pre-License Course",
    productType: "real_estate_prelicense",
    currency: "usd",
    approvalStatus: process.env.STATECOURSE_ME_SALES_AGENT_APPROVAL_STATUS || "submission_draft",
    enrollmentEnabled: bool("STATECOURSE_ME_SALES_AGENT_ENROLLMENT_ENABLED"),
    price: {
      test: cents("STATECOURSE_PRICE_ME_SALES_AGENT_TEST_CENTS"),
      live: cents("STATECOURSE_PRICE_ME_SALES_AGENT_LIVE_CENTS"),
    },
    versions: {
      regulatoryAcknowledgment: "me-sales-agent-regulatory-draft-v1",
      terms: "statecourse-terms-v1",
      refundPolicy: "me-sales-agent-refund-pending-review-v1",
      cancellationPolicy: "me-sales-agent-cancellation-pending-review-v1",
    },
  },
  "va-salesperson": {
    id: "va-salesperson",
    state: "VA",
    name: "Virginia Principles and Practices of Real Estate",
    productType: "real_estate_prelicense",
    currency: "usd",
    approvalStatus: process.env.STATECOURSE_VA_SALESPERSON_APPROVAL_STATUS || "submission_draft",
    enrollmentEnabled: bool("STATECOURSE_VA_SALESPERSON_ENROLLMENT_ENABLED"),
    price: {
      test: cents("STATECOURSE_PRICE_VA_SALESPERSON_TEST_CENTS"),
      live: cents("STATECOURSE_PRICE_VA_SALESPERSON_LIVE_CENTS"),
    },
    versions: {
      regulatoryAcknowledgment: "va-salesperson-regulatory-draft-v1",
      terms: "statecourse-terms-v1",
      refundPolicy: "va-salesperson-refund-pending-review-v1",
      cancellationPolicy: "va-salesperson-cancellation-pending-review-v1",
    },
  },
};

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
    if (process.env.STATECOURSE_LIVE_PAYMENTS_ENABLED !== "true") {
      return { allowed: false, reason: "live_payments_disabled" };
    }
    if (course.approvalStatus !== "approved") {
      return { allowed: false, reason: "course_not_approved" };
    }
    if (!course.enrollmentEnabled) {
      return { allowed: false, reason: "enrollment_disabled" };
    }
    return { allowed: true, qaOnly: false };
  }

  if (course.approvalStatus !== "approved" || !course.enrollmentEnabled) {
    if (process.env.STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES !== "true") {
      return { allowed: false, reason: "sandbox_draft_testing_disabled" };
    }
  }

  return { allowed: true, qaOnly: true };
}
