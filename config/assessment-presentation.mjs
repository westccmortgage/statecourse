/**
 * Presentation order for assessments, shared across jurisdictions.
 *
 * Kansas forced this. K.A.R. 86-1-10(c)(1)(D) requires an asynchronous course to supply
 * "evidence that the system used for testing students will scramble questions and items
 * for any quizzes or examinations to ensure a random presentation." The platform already
 * permutes an item's CHOICES; it delivered ITEMS in a fixed order. This module supplies
 * the missing half without giving up the property every completion record depends on.
 *
 * The property: a recorded answer must keep its meaning permanently.
 *
 * Choice order is safe today because it is a pure function of the item id — the same item
 * always presents the same way, so a stored selected_choice can be re-read years later.
 * Item order cannot work that way, because a fixed function of the assessment id is not a
 * random presentation; it is the same order every time, which is what the rule is aimed at.
 *
 * The resolution is that presentation order is a pure function of a seed that is RECORDED
 * WITH THE ATTEMPT. Given the seed, the exact sequence a student saw is reconstructible
 * forever, so positional answers stay meaningful and an auditor can rebuild the paper.
 * A presentation whose order cannot be reconstructed is not an audit trail, whatever else
 * it is, so `presentAssessment` refuses to run without a seed rather than inventing one.
 *
 * Nothing here touches choice permutation, which stays keyed to the item id.
 */

/* FNV-1a. Same function the course engines use for choice order; duplicated deliberately
   rather than imported, so that a change made for one purpose cannot silently reorder the
   other. */
function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/**
 * Deterministic Fisher-Yates over `length`, seeded by `seed`.
 * Returns the presented order as an array of source indices.
 */
export function permutationFor(length, seed) {
  const order = Array.from({ length }, (_, index) => index);
  let state = hashKey(String(seed)) || 1;
  for (let index = order.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 48271) + 11) >>> 0;
    const swap = state % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return order;
}

/**
 * Present an assessment in a per-attempt order.
 *
 * `attemptSeed` must be supplied by the caller and stored with the attempt record. It is
 * intentionally not defaulted and not generated here: a seed this module invented would
 * be lost the moment the process ended, and the attempt would become unreconstructible.
 *
 * Returns the assessment with `items` in presented order, plus `presentationSeed` and
 * `presentationOrder` so both can be written to the attempt record.
 */
export function presentAssessment(assessment, attemptSeed) {
  if (!assessment || !Array.isArray(assessment.items)) return null;
  if (typeof attemptSeed !== "string" || attemptSeed.length === 0) return null;
  const order = permutationFor(assessment.items.length, `${assessment.id}:${attemptSeed}`);
  return {
    ...assessment,
    presentationSeed: attemptSeed,
    presentationOrder: order,
    items: order.map((index) => assessment.items[index])
  };
}

/**
 * Rebuild the exact presentation a recorded attempt saw, from the stored seed.
 *
 * This is the function an auditor's report runs. If it ever disagrees with
 * `presentAssessment` for the same seed, the audit trail is broken, and the test suite
 * asserts they agree.
 */
export function replayPresentation(assessment, attemptRecord = {}) {
  const seed = attemptRecord.presentation_seed ?? attemptRecord.presentationSeed ?? null;
  if (!seed) return null;
  return presentAssessment(assessment, seed);
}

/**
 * Map positional answers recorded against a presented order back to item ids.
 *
 * Scoring works positionally against the presented assessment, which is correct as long
 * as the same presentation is used for both. This exists for the reporting path, where a
 * stored answer array has to be read against a stored seed long after the fact.
 */
export function answersByItemId(presented, answers = []) {
  if (!presented || !Array.isArray(presented.items)) return null;
  if (!Array.isArray(answers) || answers.length !== presented.items.length) return null;
  const mapped = {};
  for (const [position, item] of presented.items.entries()) {
    mapped[item.id] = answers[position];
  }
  return mapped;
}
