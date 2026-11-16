/**
 * Conservative StateCourse delivery policy for California correspondence courses.
 *
 * A California 45-hour course is delivered as 15 three-hour assignments.  The active-time
 * ledger already records only visible, focused, non-idle study.  This module turns that trusted
 * assignment ledger into cumulative screen gates so a student cannot click through the lesson
 * and assessments before the assignment's three hours have actually accrued.
 *
 * The final completion screen receives no separate slice: the last teaching/assessment screen
 * owns the assignment's full time requirement.  Review/admin access bypasses this policy in the
 * calling layer and never earns student credit.
 */

import { MORTGAGE_SCREEN_STUDY_METRICS } from './california/mortgage-screen-study-metrics.mjs';

function finiteNonNegative(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export function timedScreens(delivery) {
  return (delivery?.blocks || []).flatMap((block) =>
    (block.screens || [])
      .filter((screen) => screen.type !== "completion")
      .map((screen) => ({
        blockId: block.id,
        screenId: screen.id,
        screenType: screen.type,
        ...(MORTGAGE_SCREEN_STUDY_METRICS[screen.id] || {}),
      })),
  );
}

/* A one-question retrieval check is evidence that the student studied the preceding material;
   it is not six more minutes of instruction. Keep those checks to two minutes and put the
   remaining assignment time where the learning actually happens. The weights are relative,
   not minutes: the allocator below always preserves the assignment's regulator-facing total. */
const RETRIEVAL_SECONDS = 2 * 60;
const SCREEN_WEIGHTS = Object.freeze({
  instruction: 5,
  practice: 4,
  review: 3,
  applied: 8,
  mastery: 5,
});

function fixedScreenSeconds(screen) {
  if (screen.screenType === 'retrieval') return RETRIEVAL_SECONDS;
  if (Object.hasOwn(screen, 'words') && screen.screenType === 'applied') return 3 * 60;
  if (Object.hasOwn(screen, 'words') && screen.screenType === 'mastery') return 10 * 60;
  return null;
}

function screenEffort(screen) {
  const words = finiteNonNegative(screen.words);
  if (Object.hasOwn(screen, 'words')) {
    if (screen.screenType === 'instruction') return Math.max(words, 150);
    if (screen.screenType === 'practice') return Math.max(words + 400, 600);
    if (screen.screenType === 'review') return Math.max(words + 100, 300);
    if (screen.screenType === 'applied') return 1500;
    if (screen.screenType === 'mastery') return 600;
  }
  return (SCREEN_WEIGHTS[screen.screenType] || 4) * 100;
}

function screenAllocations(delivery, expectedMinutes) {
  const screens = timedScreens(delivery);
  const totalSeconds = Math.round(finiteNonNegative(expectedMinutes) * 60);
  if (!screens.length || totalSeconds <= 0) return screens.map(() => 0);

  const fixedTotal = screens.reduce((sum, screen) => sum + (fixedScreenSeconds(screen) || 0), 0);
  const flexibleTotal = Math.max(0, totalSeconds - fixedTotal);
  const totalWeight = screens.reduce((sum, screen) =>
    sum + (fixedScreenSeconds(screen) !== null ? 0 : screenEffort(screen)), 0);

  /* Largest-remainder allocation keeps every screen on an integer second while preserving the
     exact assignment total. Equal fractional remainders resolve in screen order, deterministically. */
  const allocations = screens.map((screen, index) => {
    const fixedSeconds = fixedScreenSeconds(screen);
    if (fixedSeconds !== null) return { index, seconds: fixedSeconds, remainder: -1 };
    const weight = screenEffort(screen);
    const exact = totalWeight ? (flexibleTotal * weight) / totalWeight : 0;
    return { index, seconds: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let unallocated = totalSeconds - allocations.reduce((sum, item) => sum + item.seconds, 0);
  for (const item of [...allocations]
    .filter((entry) => entry.remainder >= 0)
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index)) {
    if (unallocated <= 0) break;
    item.seconds += 1;
    unallocated -= 1;
  }
  return allocations.sort((left, right) => left.index - right.index).map((item) => item.seconds);
}

export function screenStudyGate(delivery, expectedMinutes, screenId, activeSeconds) {
  const screens = timedScreens(delivery);
  const allocations = screenAllocations(delivery, expectedMinutes);
  const elapsedSeconds = Math.floor(finiteNonNegative(activeSeconds));
  const index = screens.findIndex((item) => item.screenId === screenId);

  if (!screens.length || !allocations.length || index < 0) {
    return Object.freeze({
      requiredCumulativeSeconds: 0,
      allocatedSeconds: 0,
      remainingSeconds: 0,
      ready: true,
    });
  }

  const previousRequired = allocations.slice(0, index).reduce((sum, seconds) => sum + seconds, 0);
  const requiredCumulativeSeconds = previousRequired + allocations[index];
  const remainingSeconds = Math.max(0, requiredCumulativeSeconds - elapsedSeconds);
  return Object.freeze({
    requiredCumulativeSeconds,
    allocatedSeconds: requiredCumulativeSeconds - previousRequired,
    remainingSeconds,
    ready: remainingSeconds === 0,
  });
}

export function firstUnmetStudyGate(delivery, expectedMinutes, activeSeconds) {
  const screens = timedScreens(delivery);
  for (const item of screens) {
    const gate = screenStudyGate(delivery, expectedMinutes, item.screenId, activeSeconds);
    if (!gate.ready) return Object.freeze({ blockId: item.blockId, screenId: item.screenId, ...gate });
  }
  return null;
}

export function earlierDeliveryPosition(delivery, left, right) {
  if (!left) return right || null;
  if (!right) return left;
  const order = new Map();
  let ordinal = 0;
  for (const block of delivery?.blocks || []) {
    for (const screen of block.screens || []) {
      order.set(`${block.id}:${screen.id}`, ordinal++);
    }
  }
  const leftOrder = order.get(`${left.blockId}:${left.screenId}`);
  const rightOrder = order.get(`${right.blockId}:${right.screenId}`);
  if (!Number.isInteger(leftOrder)) return right;
  if (!Number.isInteger(rightOrder)) return left;
  return leftOrder <= rightOrder ? left : right;
}
