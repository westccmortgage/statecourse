import { getCaliforniaCourse } from "./california-course-engine.mjs";
import {
  getBlockDelivery as getCaliforniaDelivery,
  hasBlockDelivery as hasCaliforniaDelivery,
  getBlockQuestion as getCaliforniaQuestion,
} from "./california-block-engine.mjs";
import { LAW_OF_AGENCY_RETRIEVAL, completeLawOfAgencyDelivery } from "./texas/law-of-agency-block-retrieval.mjs";
import { TEXAS_LAW_OF_AGENCY_STUDENT_CONFIG } from "./texas/law-of-agency-student-config.mjs";
import { MODULE_1_BLOCKS as LOA_1 } from "./texas/law-of-agency-module-1-blocks.mjs";
import { MODULE_2_BLOCKS as LOA_2 } from "./texas/law-of-agency-module-2-blocks.mjs";
import { MODULE_3_BLOCKS as LOA_3 } from "./texas/law-of-agency-module-3-blocks.mjs";
import { MODULE_4_BLOCKS as LOA_4 } from "./texas/law-of-agency-module-4-blocks.mjs";
import { MODULE_5_BLOCKS as LOA_5 } from "./texas/law-of-agency-module-5-blocks.mjs";
import { MODULE_6_BLOCKS as LOA_6 } from "./texas/law-of-agency-module-6-blocks.mjs";
import { MODULE_7_BLOCKS as LOA_7 } from "./texas/law-of-agency-module-7-blocks.mjs";
import { MODULE_8_BLOCKS as LOA_8 } from "./texas/law-of-agency-module-8-blocks.mjs";
import { MODULE_9_BLOCKS as LOA_9 } from "./texas/law-of-agency-module-9-blocks.mjs";
import { MODULE_10_BLOCKS as LOA_10 } from "./texas/law-of-agency-module-10-blocks.mjs";
import { MODULE_11_BLOCKS as LOA_11 } from "./texas/law-of-agency-module-11-blocks.mjs";
import { MODULE_12_BLOCKS as LOA_12 } from "./texas/law-of-agency-module-12-blocks.mjs";

/**
 * Which course configuration and which block delivery a student request resolves to.
 *
 * The student path used to reach California directly: one hard state check, one call to
 * getCaliforniaCourse, one call to the California block engine. That is why no other
 * state could be studied — not because the machinery was California-shaped, but because
 * the lookup was. SB 1495 participation already conditions on the course id, and timing
 * already comes from the course record, so the rest generalises once the lookup does.
 *
 * Each state keeps its own configuration and its own regulatory posture. This dispatches;
 * it does not harmonise. A course that is not approved stays not approved, and a course
 * whose certificate issuance is off stays off, because those values are read from the
 * state's own record rather than defaulted here.
 */

const TEXAS_LOA_DELIVERIES = new Map(
  [LOA_1, LOA_2, LOA_3, LOA_4, LOA_5, LOA_6, LOA_7, LOA_8, LOA_9, LOA_10, LOA_11, LOA_12]
    .map((delivery) => [`${delivery.courseId}:${delivery.moduleId}`, delivery]),
);

/* Registered configurations, by course id. California delegates to its engine so its
   behaviour is unchanged; Texas supplies its own record. */
const CONFIGURATIONS = Object.freeze({
  [TEXAS_LAW_OF_AGENCY_STUDENT_CONFIG.courseId]: () => TEXAS_LAW_OF_AGENCY_STUDENT_CONFIG,
});

export function getCourseConfiguration(courseId) {
  const key = String(courseId || "");
  if (CONFIGURATIONS[key]) return CONFIGURATIONS[key]();
  /* Anything not registered here is California's, resolved exactly as before. */
  return getCaliforniaCourse(key) || null;
}

/*
 * California names a delivery unit `assignmentId`, Texas names it `moduleId`. Both arrive
 * here as one argument because a student request carries one identifier, and the caller
 * should not have to know which vocabulary a state uses.
 */
export function getCourseDelivery(courseId, deliveryId) {
  const key = String(courseId || "");
  const unit = String(deliveryId || "");
  if (TEXAS_LOA_DELIVERIES.has(`${key}:${unit}`)) {
    const delivery = TEXAS_LOA_DELIVERIES.get(`${key}:${unit}`);
    /* Normalised so callers can read `assignmentId` whichever state answered. */
    return completeLawOfAgencyDelivery(delivery);
  }
  return getCaliforniaDelivery(key, unit);
}

export function hasCourseDelivery(courseId, deliveryId) {
  return TEXAS_LOA_DELIVERIES.has(`${String(courseId || "")}:${String(deliveryId || "")}`)
    || hasCaliforniaDelivery(String(courseId || ""), String(deliveryId || ""));
}

// A question belongs to the registered course, including its remediation replacement.
// Do not let an identifier from another course select that course's question bank.
const courseQuestions = new Map();
export function getCourseQuestion(courseId, questionId) {
  const course = getCourseConfiguration(courseId);
  if (!course || !questionId) return null;
  const lookup = course.state === "TX" ? (id,question) => getCaliforniaQuestion(id,question,LAW_OF_AGENCY_RETRIEVAL) : getCaliforniaQuestion;
  if (!courseQuestions.has(courseId)) {
    const ids = new Set();
    for (const unit of course.assignments) {
      for (const block of getCourseDelivery(courseId, unit.id)?.blocks || []) {
        for (const screen of block.screens) {
          if (screen.type !== "retrieval") continue;
          ids.add(screen.questionId);
          const primary = lookup(courseId, screen.questionId);
          if (primary?.replacementId) ids.add(primary.replacementId);
        }
      }
    }
    courseQuestions.set(courseId, ids);
  }
  return courseQuestions.get(courseId).has(questionId) ? lookup(courseId, questionId) : null;
}

/** Every course a student can currently be served, for diagnostics and the catalog view. */
export function renderableCourseIds() {
  return [
    ...Object.keys(CONFIGURATIONS),
    ...new Set([...TEXAS_LOA_DELIVERIES.keys()].map((key) => key.split(":")[0])),
    "ca-real-estate-principles-45",
    "ca-real-estate-practice-45",
    "ca-mortgage-loan-brokering-lending-45",
  ].filter((id, index, all) => all.indexOf(id) === index).sort();
}

export default Object.freeze({
  getCourseConfiguration, getCourseDelivery, hasCourseDelivery, getCourseQuestion, renderableCourseIds,
});
