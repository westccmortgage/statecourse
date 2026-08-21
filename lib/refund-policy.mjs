/*
 * California refund and cancellation policy CA-2026-08-20-v1 — the calculation.
 *
 * The policy TEXT is authoritative in config/california/submission-facts.mjs and is
 * re-exported here rather than restated, so RE 313, the enrollment acknowledgment, Terms
 * and refund administration cannot drift into four wordings of the same rule. Nothing in
 * this file paraphrases the policy; it only decides amounts from it.
 *
 * The policy has three states and they are evaluated in this order, because the later
 * conditions override the earlier ones:
 *
 *   1. NONE      — more than 60% complete, OR a final examination attempt, OR a completion
 *                  certificate issued. Whichever occurs first ends refund eligibility, so
 *                  this is checked before anything else.
 *   2. FULL      — through the LATER of seven business days after enrollment or completion
 *                  of the first lesson assignment, provided no final examination attempt.
 *   3. PRO RATA  — after the full-refund period, at 60% complete or less: the unearned
 *                  tuition, being the percentage of the course not completed.
 *
 * Order matters and is not a preference. A student at 61% is in state 1 even though the
 * full-refund window may still be open on its own terms, because the policy says the
 * disqualifiers apply "whichever occurs first".
 */

import { PRICING } from "../config/california/submission-facts.mjs";

const POLICY = PRICING.refundPolicy;

export const REFUND_POLICY_VERSION = POLICY.version;
export const REFUND_POLICY_TEXT = POLICY.policyText;
export const REFUND_POLICY_CLAUSES = Object.freeze({
  fullRefundWindow: POLICY.fullRefundWindow,
  proRataWindow: POLICY.proRataWindow,
  noRefundAfter: POLICY.noRefundAfter,
  packageAllocation: POLICY.packageAllocation,
  processing: POLICY.processing,
  requestMethod: POLICY.requestMethod,
});

/* The two figures the policy states as numbers, named once so no caller repeats them. */
export const FULL_REFUND_BUSINESS_DAYS = 7;
export const PRO_RATA_CEILING_PERCENT = 60;
export const REFUND_PROCESSING_BUSINESS_DAYS = 10;

/*
 * "Seven business days" — Monday through Friday, with no holiday calendar applied.
 *
 * The adopted policy names no holidays and this project does not invent one: a manufactured
 * holiday list would be a rule no source states. The effect is bounded and is recorded here
 * so it is a stated decision rather than a silent one. Excluding a holiday would LENGTHEN
 * the full-refund window, so counting Monday-to-Friday alone is the shorter, less
 * consumer-favourable reading of the two, and it should be confirmed against whatever
 * holiday convention StateCourse LLC adopts before the policy is filed on RE 313.
 *
 * In practice this rarely decides an outcome, because the full-refund window closes at the
 * LATER of this date and the completion of the first lesson assignment.
 */
export function addBusinessDays(from, days) {
  const date = new Date(from.getTime());
  if (Number.isNaN(date.getTime())) throw new TypeError("addBusinessDays: invalid date");
  if (!Number.isInteger(days) || days < 0) throw new RangeError("addBusinessDays: days must be a non-negative integer");
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return date;
}

const asDate = (value, field) => {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError(`refund basis: ${field} is not a valid date`);
  return date;
};

/*
 * Percent complete is read strictly. The coercion guard is the same one every course engine
 * in this project carries: Number(null), Number(""), Number(false) and Number([]) are all 0,
 * and 0 percent complete is the most refund-favourable value there is. A missing progress
 * figure must stop the calculation, not silently become a full refund.
 */
const asPercent = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError("refund basis: percentComplete must be a finite number");
  }
  if (value < 0 || value > 100) throw new RangeError("refund basis: percentComplete must be between 0 and 100");
  return value;
};

const asCents = (value, field) => {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`refund basis: ${field} must be a non-negative integer of cents`);
  return value;
};

/**
 * Decide one course's refund.
 *
 * @param {object} basis
 * @param {number} basis.allocatedAmount        cents attributed to this course at checkout
 * @param {number} basis.alreadyRefunded        cents already refunded against this course
 * @param {Date|string} basis.enrolledAt
 * @param {Date|string|null} basis.firstAssignmentCompletedAt  null while assignment 1 is unfinished
 * @param {Date|string} basis.requestReceivedAt the policy's effective date
 * @param {number} basis.percentComplete        0-100
 * @param {boolean} basis.finalExamAttempted
 * @param {boolean} basis.certificateIssued
 * @returns {{outcome: "full"|"pro_rata"|"none", amount: number, refundablePercent: number,
 *            reason: string, policyVersion: string, courseId?: string}}
 */
export function evaluateCourseRefund(basis) {
  const allocated = asCents(basis.allocatedAmount, "allocatedAmount");
  const alreadyRefunded = asCents(basis.alreadyRefunded ?? 0, "alreadyRefunded");
  const remaining = Math.max(0, allocated - alreadyRefunded);
  const percentComplete = asPercent(basis.percentComplete);
  const enrolledAt = asDate(basis.enrolledAt, "enrolledAt");
  const requestReceivedAt = asDate(basis.requestReceivedAt, "requestReceivedAt");
  const firstAssignmentCompletedAt = asDate(basis.firstAssignmentCompletedAt, "firstAssignmentCompletedAt");
  if (!enrolledAt) throw new TypeError("refund basis: enrolledAt is required");
  if (!requestReceivedAt) throw new TypeError("refund basis: requestReceivedAt is required");
  if (typeof basis.finalExamAttempted !== "boolean") throw new TypeError("refund basis: finalExamAttempted must be a boolean");
  if (typeof basis.certificateIssued !== "boolean") throw new TypeError("refund basis: certificateIssued must be a boolean");

  const decided = (outcome, amount, refundablePercent, reason) =>
    Object.freeze({
      outcome,
      amount,
      refundablePercent,
      reason,
      policyVersion: REFUND_POLICY_VERSION,
      ...(basis.courseId ? { courseId: basis.courseId } : {}),
    });

  /* State 1 — the disqualifiers, "whichever occurs first". */
  if (basis.certificateIssued) {
    return decided("none", 0, 0, "A course completion certificate has been issued.");
  }
  if (basis.finalExamAttempted) {
    return decided("none", 0, 0, "A final examination has been attempted.");
  }
  if (percentComplete > PRO_RATA_CEILING_PERCENT) {
    return decided("none", 0, 0, `More than ${PRO_RATA_CEILING_PERCENT}% of the course has been completed.`);
  }

  /* State 2 — the full-refund window, which closes at the LATER of the two anchors. Where
     the first lesson assignment is not yet complete there is no later anchor to have passed,
     so the window is still open; the disqualifiers above are what bound it. */
  const businessDayAnchor = addBusinessDays(enrolledAt, FULL_REFUND_BUSINESS_DAYS);
  const businessDaysElapsed = requestReceivedAt > businessDayAnchor;
  const firstAssignmentDone = firstAssignmentCompletedAt != null && requestReceivedAt > firstAssignmentCompletedAt;
  if (!businessDaysElapsed || !firstAssignmentDone) {
    const openBecause = !businessDaysElapsed
      ? `within ${FULL_REFUND_BUSINESS_DAYS} business days of enrollment`
      : "the first lesson assignment is not yet complete";
    return decided("full", remaining, 100, `Full refund: the request is ${openBecause}, and no final examination has been attempted.`);
  }

  /* State 3 — pro rata of the unearned tuition. */
  const unearnedPercent = 100 - percentComplete;
  const amount = Math.min(remaining, Math.round((allocated * unearnedPercent) / 100));
  return decided(
    "pro_rata",
    amount,
    unearnedPercent,
    `Pro rata refund of the unearned tuition: ${unearnedPercent}% of the course is not completed.`,
  );
}

/**
 * Decide a whole payment, which may cover one course or several.
 *
 * The policy calculates each course separately and adds the results up. A completed course
 * inside a package contributes nothing and does not reduce what a barely-started course in
 * the same package is owed.
 */
export function evaluateRefund(courses) {
  if (!Array.isArray(courses) || courses.length === 0) {
    throw new TypeError("evaluateRefund: at least one course basis is required");
  }
  const perCourse = courses.map((basis) => evaluateCourseRefund(basis));
  const amount = perCourse.reduce((sum, course) => sum + course.amount, 0);
  return Object.freeze({
    policyVersion: REFUND_POLICY_VERSION,
    amount,
    outcome: amount === 0 ? "none" : perCourse.every((course) => course.outcome === "full") ? "full" : "partial",
    courses: Object.freeze(perCourse),
  });
}

/*
 * Split a package price across its component courses.
 *
 * The split is by each course's own list price, so a package containing an expensive course
 * and a cheap one does not attribute them equally. Cents are integers and a proportional
 * split almost never divides evenly, so the remainder is distributed by the largest-remainder
 * method and the result is asserted to sum to the package price exactly. A split that lost or
 * invented a cent would make a later pro-rata calculation unreproducible, which is the one
 * thing the allocation exists to prevent.
 *
 * Ties in the remainder are broken by the component's position in the list, which is fixed by
 * the catalog, so the same package always allocates the same way.
 */
export function allocatePackagePrice(packageAmount, components) {
  const total = asCents(packageAmount, "packageAmount");
  if (!Array.isArray(components) || components.length === 0) {
    throw new TypeError("allocatePackagePrice: at least one component is required");
  }
  for (const component of components) {
    if (!component || typeof component.courseId !== "string" || !component.courseId) {
      throw new TypeError("allocatePackagePrice: every component needs a courseId");
    }
    asCents(component.listAmount, `listAmount for ${component.courseId}`);
  }
  const listTotal = components.reduce((sum, component) => sum + component.listAmount, 0);
  if (listTotal <= 0) throw new RangeError("allocatePackagePrice: component list prices total zero");

  const exact = components.map((component) => (total * component.listAmount) / listTotal);
  const floors = exact.map((value) => Math.floor(value));
  let remainder = total - floors.reduce((sum, value) => sum + value, 0);

  const order = exact
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  const allocated = floors.slice();
  for (const entry of order) {
    if (remainder <= 0) break;
    allocated[entry.index] += 1;
    remainder -= 1;
  }

  const sum = allocated.reduce((value, cents) => value + cents, 0);
  if (sum !== total) {
    throw new Error(`allocatePackagePrice: allocation totals ${sum} cents, not the package price of ${total}`);
  }
  return Object.freeze(
    components.map((component, index) =>
      Object.freeze({ courseId: component.courseId, allocatedAmount: allocated[index] }),
    ),
  );
}
