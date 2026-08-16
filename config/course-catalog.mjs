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

const nextFiveCourseDefinitions = [
  ["az-salesperson-prelicense-90", "AZ", "Arizona Salesperson Pre-License — 90 Hours"],
  ["az-contract-writing-6", "AZ", "Arizona Contract Writing — 6 Hours"],
  ["wa-real-estate-fundamentals-60", "WA", "Washington Real Estate Fundamentals — 60 Hours"],
  ["wa-real-estate-practices-30", "WA", "Washington Real Estate Practices — 30 Hours"],
  ["pa-real-estate-fundamentals-30", "PA", "Pennsylvania Real Estate Fundamentals — 30 Hours"],
  ["pa-real-estate-practice-45", "PA", "Pennsylvania Real Estate Practice — 45 Hours"],
  ["nc-broker-prelicensing-75", "NC", "North Carolina Broker Prelicensing — 75 Hours"],
  ["co-real-estate-law-practice-48", "CO", "Colorado Real Estate Law and Practice — 48 Hours"],
  ["co-contracts-regulations-48", "CO", "Colorado Contracts and Regulations — 48 Hours"],
  ["co-trust-accounts-recordkeeping-8", "CO", "Colorado Trust Accounts and Record-Keeping — 8 Hours"],
  ["co-current-legal-issues-8", "CO", "Colorado Current Legal Issues — 8 Hours"],
  ["co-real-estate-closings-24", "CO", "Colorado Real Estate Closings — 24 Hours"],
  ["co-practical-applications-32", "CO", "Colorado Practical Applications — 32 Hours"],
];

const nextFiveCourse = ([id, state, name]) => {
  const envId = id.toUpperCase().replaceAll("-", "_");
  return {
    id,
    state,
    name,
    productType: "real_estate_prelicense",
    currency: "usd",
    approvalStatus: process.env[`STATECOURSE_${envId}_APPROVAL_STATUS`] || "submission_draft",
    enrollmentEnabled: bool(`STATECOURSE_${envId}_ENROLLMENT_ENABLED`),
    price: {
      test: cents(`STATECOURSE_PRICE_${envId}_TEST_CENTS`),
      live: cents(`STATECOURSE_PRICE_${envId}_LIVE_CENTS`),
    },
    versions: {
      regulatoryAcknowledgment: `${id}-regulatory-draft-v1`,
      terms: "statecourse-terms-v1",
      refundPolicy: `${id}-refund-pending-review-v1`,
      cancellationPolicy: `${id}-cancellation-pending-review-v1`,
    },
  };
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
  "wi-salesperson": {
    id: "wi-salesperson",
    state: "WI",
    name: "Wisconsin Salesperson Pre-License — 72 Hours",
    productType: "real_estate_prelicense",
    currency: "usd",
    approvalStatus: process.env.STATECOURSE_WI_SALESPERSON_APPROVAL_STATUS || "submission_draft",
    enrollmentEnabled: bool("STATECOURSE_WI_SALESPERSON_ENROLLMENT_ENABLED"),
    price: {
      test: cents("STATECOURSE_PRICE_WI_SALESPERSON_TEST_CENTS"),
      live: cents("STATECOURSE_PRICE_WI_SALESPERSON_LIVE_CENTS"),
    },
    versions: {
      regulatoryAcknowledgment: "wi-salesperson-regulatory-draft-v1",
      terms: "statecourse-terms-v1",
      refundPolicy: "wi-salesperson-refund-pending-review-v1",
      cancellationPolicy: "wi-salesperson-cancellation-pending-review-v1",
    },
  },
  "mo-salesperson-preexam-48": {
    id: "mo-salesperson-preexam-48",
    state: "MO",
    name: "Missouri Salesperson Pre-Exam Course — 48 Hours",
    productType: "real_estate_prelicense",
    currency: "usd",
    approvalStatus: process.env.STATECOURSE_MO_PREEXAM_48_APPROVAL_STATUS || "submission_draft",
    enrollmentEnabled: bool("STATECOURSE_MO_PREEXAM_48_ENROLLMENT_ENABLED"),
    price: {
      test: cents("STATECOURSE_PRICE_MO_PREEXAM_48_TEST_CENTS"),
      live: cents("STATECOURSE_PRICE_MO_PREEXAM_48_LIVE_CENTS"),
    },
    versions: {
      regulatoryAcknowledgment: "mo-preexam-48-regulatory-draft-v1",
      terms: "statecourse-terms-v1",
      refundPolicy: "mo-preexam-48-refund-pending-review-v1",
      cancellationPolicy: "mo-preexam-48-cancellation-pending-review-v1",
    },
  },
  "mo-real-estate-practice-24": {
    id: "mo-real-estate-practice-24",
    state: "MO",
    name: "Missouri Real Estate Practice Course — 24 Hours",
    productType: "real_estate_prelicense",
    currency: "usd",
    approvalStatus: process.env.STATECOURSE_MO_PRACTICE_24_APPROVAL_STATUS || "submission_draft",
    enrollmentEnabled: bool("STATECOURSE_MO_PRACTICE_24_ENROLLMENT_ENABLED"),
    price: {
      test: cents("STATECOURSE_PRICE_MO_PRACTICE_24_TEST_CENTS"),
      live: cents("STATECOURSE_PRICE_MO_PRACTICE_24_LIVE_CENTS"),
    },
    versions: {
      regulatoryAcknowledgment: "mo-practice-24-regulatory-draft-v1",
      terms: "statecourse-terms-v1",
      refundPolicy: "mo-practice-24-refund-pending-review-v1",
      cancellationPolicy: "mo-practice-24-cancellation-pending-review-v1",
    },
  },
  "ok-basic-prelicense-90": {
    id: "ok-basic-prelicense-90",
    state: "OK",
    name: "Oklahoma Basic Pre-License Course — 90 Hours",
    productType: "real_estate_prelicense",
    currency: "usd",
    approvalStatus: process.env.STATECOURSE_OK_BASIC_90_APPROVAL_STATUS || "submission_draft",
    enrollmentEnabled: bool("STATECOURSE_OK_BASIC_90_ENROLLMENT_ENABLED"),
    price: {
      test: cents("STATECOURSE_PRICE_OK_BASIC_90_TEST_CENTS"),
      live: cents("STATECOURSE_PRICE_OK_BASIC_90_LIVE_CENTS"),
    },
    versions: {
      regulatoryAcknowledgment: "ok-basic-90-regulatory-draft-v1",
      terms: "statecourse-terms-v1",
      refundPolicy: "ok-basic-90-refund-pending-review-v1",
      cancellationPolicy: "ok-basic-90-cancellation-pending-review-v1",
    },
  },
  ...Object.fromEntries(nextFiveCourseDefinitions.map((definition) => {
    const course = nextFiveCourse(definition);
    return [course.id, course];
  })),
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
