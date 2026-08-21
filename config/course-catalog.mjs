import { REFUND_POLICY_TEXT, REFUND_POLICY_VERSION, allocatePackagePrice } from "../lib/refund-policy.mjs";
import { PRICING } from "./california/submission-facts.mjs";

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
    /* The refund policy TEXT, not only its version, so the enrollment flow can display the
       policy a student is being asked to accept. RE 313's own header requires the General
       Information Page — which carries this policy — to be provided "prior to
       registration/enrollment", and a checkbox that names a version without showing the
       terms is not that. Only California has an adopted policy; the other states carry a
       version string that is still a placeholder, and returning invented text for them
       would be worse than returning none. */
    policyText: {
      refund: versions.refund === REFUND_POLICY_VERSION ? REFUND_POLICY_TEXT : null,
      cancellation: versions.cancellation === REFUND_POLICY_VERSION ? REFUND_POLICY_TEXT : null,
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
    versions:{ regulatory:"ca-real-estate-principles-45-regulatory-draft-v1", refund:REFUND_POLICY_VERSION, cancellation:REFUND_POLICY_VERSION },
  }),
  configuredCourse({
    id:"ca-real-estate-practice-45", state:"CA", name:"California Real Estate Practice — 45 Hours", env:"CA_PRACTICE_45",
    versions:{ regulatory:"ca-real-estate-practice-45-regulatory-draft-v1", refund:REFUND_POLICY_VERSION, cancellation:REFUND_POLICY_VERSION },
  }),
  configuredCourse({
    id:"ca-mortgage-loan-brokering-lending-45", state:"CA", name:"California Mortgage Loan Brokering and Lending — 45 Hours", env:"CA_MORTGAGE_45",
    versions:{ regulatory:"ca-mortgage-loan-brokering-lending-45-regulatory-draft-v1", refund:REFUND_POLICY_VERSION, cancellation:REFUND_POLICY_VERSION },
  }),
].map((course) => [course.id, course]));

/*
 * California package products, as they are disclosed on RE 313's fee field.
 *
 * A package is not a course. It has no DRE course approval of its own, and buying one buys
 * the component courses. Refunds are calculated course by course under CA-2026-08-20-v1, so
 * every package must carry an allocation that says how many cents of the package price are
 * that course's tuition — otherwise a pro-rata refund on one course of three cannot be
 * reproduced from the record.
 *
 * `statutoryTuitionCents` is the part of the price that buys DRE statutory pre-license
 * education and is therefore the part a refund is calculated against. For the
 * required-education package that is the whole price. For the complete path it is NOT,
 * because that price also buys Exam Prep and the Licensing Navigator, which carry no DRE
 * course credit — and no source in this project states how the price divides between them.
 * That split is a business decision and is left null rather than guessed; `packageAllocation`
 * refuses to allocate a package whose statutory tuition is undecided.
 */
const CALIFORNIA_STATUTORY_COURSE_IDS = Object.freeze([
  "ca-real-estate-principles-45",
  "ca-real-estate-practice-45",
  "ca-mortgage-loan-brokering-lending-45",
]);

const packages = Object.freeze({
  "ca-required-education-135": Object.freeze({
    id: "ca-required-education-135",
    state: "CA",
    name: PRICING.requiredEducation.name,
    priceCents: PRICING.requiredEducation.cents,
    statutoryTuitionCents: PRICING.requiredEducation.cents,
    componentCourseIds: CALIFORNIA_STATUTORY_COURSE_IDS,
    purchasable: false,
    notPurchasableReason:
      "Package checkout creates one enrollment per component course, which is not built. Single-course checkout is unaffected.",
  }),
  "ca-complete-path": Object.freeze({
    id: "ca-complete-path",
    state: "CA",
    name: PRICING.completePath.name,
    priceCents: PRICING.completePath.cents,
    statutoryTuitionCents: null,
    componentCourseIds: CALIFORNIA_STATUTORY_COURSE_IDS,
    purchasable: false,
    notPurchasableReason:
      "The division of this price between statutory tuition and the non-credit Exam Prep and Navigator products is undecided, so no refund allocation can be recorded.",
  }),
});

export function getPackage(packageId) {
  return packages[packageId] || null;
}

export function getPackageCatalog() {
  return Object.values(packages);
}

/*
 * The allocation a package purchase must persist at checkout. Component list prices come
 * from the catalog itself, so the split is reproducible from the record rather than from a
 * figure typed at the time of sale.
 */
export function packageAllocation(packageId) {
  const bundle = packages[packageId];
  if (!bundle) return { allocated: null, reason: "unknown_package" };
  if (bundle.statutoryTuitionCents == null) {
    return { allocated: null, reason: "statutory_tuition_share_undecided" };
  }
  const components = bundle.componentCourseIds.map((courseId) => {
    const course = courses[courseId];
    if (!course) throw new Error(`packageAllocation: ${packageId} names unknown course ${courseId}`);
    return { courseId, listAmount: PRICING.singleCourse.cents };
  });
  return { allocated: allocatePackagePrice(bundle.statutoryTuitionCents, components), reason: null };
}

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

