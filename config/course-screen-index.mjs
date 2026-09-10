/**
 * Where a video may be placed.
 *
 * The portfolio's tenth release condition is "exact non-assessment instruction-screen
 * placement". Nothing enforced that: placement was a hand edit to a screen-media registry,
 * and a typo in a screen id produced a video bound to a screen that does not exist, which
 * shows up as nothing rendering rather than as an error.
 *
 * This index answers three questions about a proposed target — does the screen exist, is it
 * an instruction screen, and does it already carry a video — against the same block maps the
 * delivery layer reads.
 *
 * Block maps that are authored but not yet in a delivery registry are indexed here on
 * purpose. Whether a course is delivered to students is a release decision made elsewhere;
 * whether a screen id is real is a question of fact, and answering it early is how a
 * placement is refused before it is recorded rather than after.
 */

import { BLOCK_DELIVERIES as CALIFORNIA_DELIVERIES } from "./california/california-block-registry.mjs";
import { BLOCK_DELIVERIES as TEXAS_DELIVERIES } from "./texas/texas-block-registry.mjs";

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
import { testDeliveries } from "./test-fixtures/console-test-course.mjs";

/* Only this type may carry a video. Every other screen type either scores a response or
   exists to be reviewed against one, and the release condition excludes all of them. */
export const PLACEABLE_SCREEN_TYPE = "instruction";

const LAW_OF_AGENCY = [LOA_1, LOA_2, LOA_3, LOA_4, LOA_5, LOA_6, LOA_7, LOA_8, LOA_9, LOA_10, LOA_11, LOA_12];

/* California calls a delivery unit `assignmentId`, Texas calls it `moduleId`. The console
   speaks one word — deliveryId — so an operator is not asked which of two names their state
   happens to use. */
function normalize(delivery) {
  const deliveryId = delivery.moduleId || delivery.assignmentId || null;
  if (!delivery.courseId || !deliveryId) return null;
  return {
    courseId: delivery.courseId,
    deliveryId,
    version: delivery.version || null,
    screens: (delivery.blocks || []).flatMap((block) => (block.screens || []).map((screen) => ({
      blockId: block.id,
      screenId: screen.id,
      sequence: screen.sequence ?? null,
      type: screen.type,
      title: screen.title || null,
      videoAssetKeys: (screen.videos || []).map((video) => video.assetKey).filter(Boolean),
    }))),
  };
}

/* testDeliveries() returns nothing unless STATECOURSE_ENABLE_TEST_FIXTURES is "true", so
   the test course is absent from production's index and a placement onto it cannot even be
   reserved there. Read once at module load, like every other delivery. */
const DELIVERIES = Object.freeze(
  [...CALIFORNIA_DELIVERIES, ...TEXAS_DELIVERIES, ...LAW_OF_AGENCY, ...testDeliveries()]
    .map(normalize)
    .filter(Boolean),
);

const BY_KEY = new Map(DELIVERIES.map((delivery) => [`${delivery.courseId}:${delivery.deliveryId}`, delivery]));

export function indexedCourseIds() {
  return [...new Set(DELIVERIES.map((delivery) => delivery.courseId))].sort();
}

export function deliveriesForCourse(courseId) {
  return DELIVERIES
    .filter((delivery) => delivery.courseId === courseId)
    .map((delivery) => ({
      deliveryId: delivery.deliveryId,
      version: delivery.version,
      screenCount: delivery.screens.length,
      instructionScreens: delivery.screens
        .filter((screen) => screen.type === PLACEABLE_SCREEN_TYPE)
        .map((screen) => ({
          screenId: screen.screenId,
          blockId: screen.blockId,
          title: screen.title,
          videoAssetKeys: screen.videoAssetKeys,
        })),
    }));
}

/*
 * A structured verdict rather than a boolean, because the console has to tell an operator
 * which of four different things went wrong, and "invalid placement" tells them none of it.
 */
export function inspectScreen(courseId, deliveryId, screenId) {
  const delivery = BY_KEY.get(`${courseId}:${deliveryId}`);
  if (!delivery) {
    return {
      ok: false,
      reason: "unknown_delivery_unit",
      knownDeliveryIds: DELIVERIES
        .filter((entry) => entry.courseId === courseId)
        .map((entry) => entry.deliveryId),
    };
  }
  const screen = delivery.screens.find((entry) => entry.screenId === screenId);
  if (!screen) return { ok: false, reason: "unknown_screen" };
  if (screen.type !== PLACEABLE_SCREEN_TYPE) {
    return { ok: false, reason: "screen_is_not_an_instruction_screen", screenType: screen.type };
  }
  return {
    ok: true,
    reason: null,
    blockId: screen.blockId,
    title: screen.title,
    /* Reported, never fatal: replacing the asset on a screen is a legitimate act, and the
       caller decides whether this particular request is one. */
    existingVideoAssetKeys: screen.videoAssetKeys,
  };
}

export default Object.freeze({ PLACEABLE_SCREEN_TYPE, indexedCourseIds, deliveriesForCourse, inspectScreen });
