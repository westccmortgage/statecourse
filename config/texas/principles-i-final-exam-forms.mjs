/**
 * Texas Principles of Real Estate I — final examination FORMS and administration proposals.
 *
 * FOUR FORMS WITH CONTROLLED PAIRWISE OVERLAP. The manifest asked for four forms assembled from the
 * 120-item bank with controlled overlap. The design: the bank is divided into six 20-item packets by
 * striping the blueprint-ordered bank (item i to packet i mod 6), and each form is the union of
 * three packets chosen so that every pair of forms shares EXACTLY one packet:
 *
 *   Form A = P1 P2 P3    Form B = P1 P4 P5    Form C = P2 P4 P6    Form D = P3 P5 P6
 *
 * Every packet sits on exactly two forms, so every bank item appears on exactly two forms, every
 * form carries 60 items, and any two forms overlap in exactly 20 (one-third) — a balanced design
 * the invariants below verify rather than assume, along with every form covering all nine topics.
 *
 * ADMINISTRATION IS PROPOSED, NOT SET. Every constant in ADMINISTRATION is a StateCourse LLC
 * proposal labelled PROVIDER_PROPOSED_PENDING_TAC_CONFIRMATION: exam-administration requirements
 * (proctoring, identity validation acceptable to the Commission, timing) live in the codified
 * 22 TAC provider rules (§ 535.65 as adopted effective 2026-08-31) that await human export, and
 * TX_PROVIDER_RULE_SOURCE_LOCK is FAIL until they are read. EXAM_READY therefore stays BLOCKED,
 * the engine refuses to administer, and none of these figures may be described anywhere as a TREC
 * requirement.
 */

import { FINAL_EXAM_BANK, FORMS_FULL, FORM_PACKETS } from "./principles-i-final-exam-bank.mjs";
import { TOPICS } from "./prins1-course-form.mjs";

export { FORM_PACKETS };

const byId = new Map(FINAL_EXAM_BANK.map((item) => [item.id, item]));

/* Id-level view of the bank's form composition, for the engine and the invariants below. */
export const FORMS = Object.freeze(
  Object.fromEntries(
    Object.entries(FORMS_FULL).map(([form, items]) => [
      form,
      Object.freeze(items.map((item) => item.id)),
    ]),
  ),
);

export const ADMINISTRATION = Object.freeze({
  label: "PROVIDER_PROPOSED_PENDING_TAC_CONFIRMATION",
  note: "StateCourse LLC proposals for exam administration, held for confirmation or correction against the codified 22 TAC provider rules once exported and read. None of these figures is a TREC requirement, and no examination may be administered while EXAM_READY is BLOCKED.",
  examReady: "BLOCKED_TX_PROVIDER_RULE_SOURCE_LOCK",
  questionsPerForm: 60,
  proposedTimeLimitMinutes: 120,
  proposedPassingPercent: 70,
  proposedMaxAttempts: 2,
  proposedFormRotation: Object.freeze(["A", "B", "C", "D"]),
});

/* ── Load-time invariants over the design. ─────────────────────────────────────────── */

const formIds = Object.keys(FORMS);
if (formIds.length !== 4) throw new Error(`final forms: ${formIds.length} forms against the manifest's four`);

const appearances = new Map();
for (const [form, ids] of Object.entries(FORMS)) {
  if (ids.length !== ADMINISTRATION.questionsPerForm) {
    throw new Error(`final forms: form ${form} carries ${ids.length} items against ${ADMINISTRATION.questionsPerForm}`);
  }
  const unique = new Set(ids);
  if (unique.size !== ids.length) throw new Error(`final forms: form ${form} repeats an item`);
  for (const id of ids) {
    if (!byId.has(id)) throw new Error(`final forms: form ${form} names unknown item ${id}`);
    appearances.set(id, (appearances.get(id) ?? 0) + 1);
  }
  /* Every form must examine every PRINS1-1 topic. */
  const topics = new Set(ids.map((id) => byId.get(id).tests.slice(0, 3)));
  for (const topic of TOPICS) {
    if (!topics.has(topic.code)) throw new Error(`final forms: form ${form} does not cover topic ${topic.code}`);
  }
}
for (const item of FINAL_EXAM_BANK) {
  if ((appearances.get(item.id) ?? 0) !== 2) {
    throw new Error(`final forms: ${item.id} appears on ${appearances.get(item.id) ?? 0} forms rather than exactly two`);
  }
}
for (let a = 0; a < formIds.length; a += 1) {
  for (let b = a + 1; b < formIds.length; b += 1) {
    const setA = new Set(FORMS[formIds[a]]);
    const overlap = FORMS[formIds[b]].filter((id) => setA.has(id)).length;
    if (overlap !== 20) {
      throw new Error(`final forms: forms ${formIds[a]} and ${formIds[b]} overlap in ${overlap} items rather than 20`);
    }
  }
}

export default Object.freeze({ FORMS, FORM_PACKETS, ADMINISTRATION });
