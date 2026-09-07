/** PROTECTED original provider examinations, not the state licensing examination.
 * 132 bank items:108 shared by exactly two versions plus24 unique to one version.
 * Every pair shares18/60; each version has60 items and includes every required topic.
 * This assembly is not evidence of semantic separation or regulatory approval.
 */
import { FINAL_EXAM_BANK } from "./promulgated-contract-forms-final-exam-bank.mjs";
import { TOPICS } from "./promulgated-contract-forms-course-form.mjs";
const queues = TOPICS.map(topic => FINAL_EXAM_BANK.filter(item => item.topic === topic.code));
const ordered = [];
while (queues.some(queue => queue.length)) for (const queue of queues) if (queue.length) ordered.push(queue.shift());
if (ordered.length !== 132) throw new Error("PCF final assembly requires132 actual items");
const bins = { A: [], B: [], C: [], D: [] };
let cursor = 0;
for (const [a, b] of [["A", "B"], ["A", "C"], ["A", "D"], ["B", "C"], ["B", "D"], ["C", "D"]]) {
  for (let i = 0; i < 18; i++) {
    const id = ordered[cursor++].id;
    bins[a].push(id); bins[b].push(id);
  }
}
for (const list of Object.values(bins)) for (let i = 0; i < 6; i++) list.push(ordered[cursor++].id);
export const FORMS = Object.freeze(Object.fromEntries(Object.entries(bins).map(([version, ids]) => [version, Object.freeze(ids)])));
export const FORM_DEFINITIONS = Object.freeze(Object.fromEntries(Object.entries(FORMS).map(([version, itemIds]) => [version,
  Object.freeze({ version, id: `PCF-FORM-${version}`, itemIds, questionCount: 60, passingCount: 42,
    passingPercent: 70, closedBook: true, productionAdministrationEnabled: false })])));
const byId = new Map(FINAL_EXAM_BANK.map(item => [item.id, item]));
for (const [version, ids] of Object.entries(FORMS)) {
  if (ids.length !== 60 || new Set(ids).size !== 60) throw new Error(`PCF ${version}: item count`);
  for (const topic of TOPICS) if (!ids.some(id => byId.get(id)?.topic === topic.code)) throw new Error(`PCF ${version}: missing ${topic.code}`);
}
export default FORMS;
