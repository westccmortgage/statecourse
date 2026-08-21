import { getCourseCatalog, evaluateCheckoutEligibility } from "../../config/course-catalog.mjs";
import { response } from "./_lib/http.mjs";

export const handler = async () => {
  const mode = process.env.STRIPE_MODE === "live" ? "live" : "test";
  const courses = getCourseCatalog().map((course) => {
    const eligibility = evaluateCheckoutEligibility(course, mode);
    return {
      id: course.id,
      state: course.state,
      name: course.name,
      currency: course.currency,
      amount: course.price[mode],
      approvalStatus: course.approvalStatus,
      checkoutEnabled: eligibility.allowed,
      checkoutBlockReason: eligibility.allowed ? null : eligibility.reason,
      qaOnly: Boolean(eligibility.qaOnly),
      versions: course.versions,
      policyText: course.policyText,
    };
  });
  return response(200, {
    mode,
    productionPaymentsEnabled: mode === "live" && process.env.STATECOURSE_LIVE_PAYMENTS_ENABLED === "true",
    courses,
  });
};
