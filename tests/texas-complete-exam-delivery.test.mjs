import test from "node:test";
import assert from "node:assert/strict";
import { prepareTexasFinal } from "../config/texas/complete-course-exam-delivery.mjs";
import { FINAL_EXAM_BANK } from "../config/texas/promulgated-contract-forms-final-exam-bank.mjs";
import { FORMS } from "../config/texas/promulgated-contract-forms-final-exam-forms.mjs";

test("all PCF final versions contain60 known items/all topics and pairwise18 overlap", () => {
  assert.equal(FINAL_EXAM_BANK.length, 132);
  const byId = new Map(FINAL_EXAM_BANK.map(item => [item.id, item]));
  for (const [a, ids] of Object.entries(FORMS)) {
    assert.equal(ids.length, 60); assert.equal(new Set(ids).size, 60);
    assert.equal(new Set(ids.map(id => byId.get(id).topic)).size, 9);
    for (const [b, other] of Object.entries(FORMS)) if (a < b) assert.equal(ids.filter(id => other.includes(id)).length, 18);
  }
  assert.equal(new Set(Object.values(FORMS).flat()).size, 132);
});

test("every display position is balanced and grades actual displayed choices correctly", () => {
  for (const [version, itemIds] of Object.entries(FORMS)) {
    const prepared = prepareTexasFinal({ bank: FINAL_EXAM_BANK, itemIds, version, freeze: "DRAFT-TEST" });
    const byId = new Map(FINAL_EXAM_BANK.map(item => [item.id, item]));
    const answers = Object.fromEntries(prepared.questions.map(item => {
      const authored = byId.get(item.id);
      return [item.id, item.choices.indexOf(authored.choices[authored.correctChoice])];
    }));
    assert.deepEqual([0, 1, 2, 3].map(position => Object.values(answers).filter(choice => choice === position).length), [15, 15, 15, 15]);
    assert.equal(prepared.grade(answers).correct, 60);
    for (const position of [0, 1, 2, 3]) {
      assert.equal(prepared.grade(Object.fromEntries(itemIds.map(id => [id, position]))).correct, 15);
    }
    assert.deepEqual(prepared.questions, prepareTexasFinal({ bank: FINAL_EXAM_BANK, itemIds, version, freeze: "DRAFT-TEST" }).questions);
    for (const item of prepared.questions) assert.deepEqual(Object.keys(item).sort(), ["choices", "id", "prompt"]);
    assert.throws(() => prepared.grade({}), /every final/);
    assert.throws(() => prepared.grade({ ...answers, unknown: 0 }), /every final/);
  }
});

test("permutation respects nonzero authored keys and refuses malformed source items", () => {
  const bank = Array.from({ length: 8 }, (_, i) => ({ id: `X${i}`, prompt: `Prompt${i}`,
    choices: ["a", "b", "c", "d"], correctChoice: i % 4 }));
  const input = { bank, itemIds: bank.map(item => item.id), version: "A", freeze: "X" };
  const prepared = prepareTexasFinal(input);
  const answers = Object.fromEntries(prepared.questions.map((item, i) => [item.id, item.choices.indexOf(bank[i].choices[bank[i].correctChoice])]));
  assert.equal(prepared.grade(answers).correct, 8);
  assert.throws(() => prepareTexasFinal({ ...input, itemIds: ["unknown"] }), /Invalid/);
  assert.throws(() => prepareTexasFinal({ ...input, itemIds: ["X0", "X0"] }), /distinct/);
  assert.throws(() => prepareTexasFinal({ ...input, bank: bank.map(item => ({ ...item, correctChoice: 9 })) }), /Invalid/);
});
