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

function finiteNonNegative(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export function timedScreens(delivery) {
  return (delivery?.blocks || []).flatMap((block) =>
    (block.screens || [])
      .filter((screen) => screen.type !== "completion")
      .map((screen) => ({ blockId: block.id, screenId: screen.id })),
  );
}

export function screenStudyGate(delivery, expectedMinutes, screenId, activeSeconds) {
  const screens = timedScreens(delivery);
  const totalSeconds = Math.round(finiteNonNegative(expectedMinutes) * 60);
  const elapsedSeconds = Math.floor(finiteNonNegative(activeSeconds));
  const index = screens.findIndex((item) => item.screenId === screenId);

  if (!screens.length || totalSeconds <= 0 || index < 0) {
    return Object.freeze({
      requiredCumulativeSeconds: 0,
      allocatedSeconds: 0,
      remainingSeconds: 0,
      ready: true,
    });
  }

  const previousRequired = index === 0 ? 0 : Math.ceil((totalSeconds * index) / screens.length);
  const requiredCumulativeSeconds = Math.ceil((totalSeconds * (index + 1)) / screens.length);
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
    if (!gate.ready) return Object.freeze({ ...item, ...gate });
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
