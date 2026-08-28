/**
 * Texas Principles of Real Estate I — final examination engine (TX-1B delivery code).
 *
 * WHAT IT DOES. Assembles a student-safe rendering of one exam form (answer key and rationales
 * stripped, choices permuted deterministically per item exactly as the California engines permute),
 * scores a set of responses server-side from the bank, and selects the form for a given attempt
 * under the proposed rotation.
 *
 * WHAT IT REFUSES. assertExamAdministrationAllowed() throws while ADMINISTRATION.examReady is
 * BLOCKED — which it is until the codified 22 TAC provider rules are exported, read, and the
 * administration parameters confirmed. No student surface may call assembleStudentForm without
 * passing through that gate first; the gate is also enforced here so a future caller cannot
 * forget it.
 */

import { FINAL_EXAM_BANK } from "../config/texas/principles-i-final-exam-bank.mjs";
import { FORMS, ADMINISTRATION } from "../config/texas/principles-i-final-exam-forms.mjs";

const byId = new Map(FINAL_EXAM_BANK.map((item) => [item.id, item]));

/* Same deterministic permutation the California engines use: items are authored with the correct
   answer at index 0 for reviewability, and each item's choices are permuted from a stable key so a
   recorded selected choice keeps meaning the same option forever. */
function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function permuteChoices(choices, correctChoice, key) {
  const order = choices.map((_, index) => index);
  let seed = hashKey(key) || 1;
  for (let index = order.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 48271) + 11) >>> 0;
    const swap = seed % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return { choices: order.map((index) => choices[index]), correctChoice: order.indexOf(correctChoice) };
}

export function assertExamAdministrationAllowed() {
  if (ADMINISTRATION.examReady !== "READY") {
    throw new Error(
      `texas_final_exam_not_administrable: ${ADMINISTRATION.examReady} — the codified 22 TAC provider rules must be read and the administration parameters confirmed before any attempt may be served`,
    );
  }
}

/* The proposed rotation: attempt 1 serves form A, attempt 2 form B, and so on — a proposal pending
   TAC confirmation like every other administration parameter. */
export function formForAttempt(attemptNumber) {
  const rotation = ADMINISTRATION.proposedFormRotation;
  if (!Number.isInteger(attemptNumber) || attemptNumber < 1 || attemptNumber > rotation.length) return null;
  return rotation[attemptNumber - 1];
}

function presentedItem(itemId) {
  const item = byId.get(itemId);
  const presented = permuteChoices(item.choices, item.correctChoice, `tx-prins1-final:${item.id}`);
  return { item, presented };
}

/* Student-safe: no correctChoice, no rationale, no tests trace. The permutation is recomputed at
   scoring time from the same key, so nothing secret needs to travel with the form. */
export function assembleStudentForm(form) {
  assertExamAdministrationAllowed();
  const ids = FORMS[form];
  if (!ids) return null;
  return {
    course: "tx-principles-real-estate-i-30-v1",
    form,
    questionCount: ids.length,
    items: ids.map((id, index) => {
      const { presented } = presentedItem(id);
      return { id, position: index + 1, prompt: byId.get(id).prompt, choices: presented.choices };
    }),
  };
}

/* Server-side scoring from the bank: answers is { itemId: selectedPresentedIndex }. Unanswered
   items score as incorrect and are reported as null, never coerced to a choice the student did not
   make. Scoring is pure — it does not itself gate on administration, so the tests can prove the
   arithmetic while the gate stays closed. */
export function scoreResponses(form, answers = {}) {
  const ids = FORMS[form];
  if (!ids) return null;
  let correct = 0;
  let answered = 0;
  const detail = ids.map((id) => {
    const { presented } = presentedItem(id);
    const raw = answers[id];
    const selected = Number.isInteger(raw) && raw >= 0 && raw < 4 ? raw : null;
    if (selected !== null) answered += 1;
    const isCorrect = selected !== null && selected === presented.correctChoice;
    if (isCorrect) correct += 1;
    return { itemId: id, selectedChoice: selected, correct: isCorrect };
  });
  const percent = Math.round((100 * correct) / ids.length);
  return {
    form,
    questionCount: ids.length,
    answered,
    correct,
    percent,
    passed: percent >= ADMINISTRATION.proposedPassingPercent,
    passingPercentStatus: ADMINISTRATION.label,
    detail,
  };
}

export default Object.freeze({ assertExamAdministrationAllowed, formForAttempt, assembleStudentForm, scoreResponses });
