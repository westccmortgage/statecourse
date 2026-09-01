import assert from "node:assert/strict";
import test from "node:test";
import {
  answersByItemId,
  permutationFor,
  presentAssessment,
  replayPresentation
} from "../config/assessment-presentation.mjs";
import { ALASKA_MODULE_IDS, getAlaskaAssessment, scoreAlaskaAssessment } from "../config/alaska-course-engine.mjs";

const sample = (count = 8) => ({
  id: "sample-engagement",
  items: Array.from({ length: count }, (_, index) => ({ id: `item-${index + 1}` }))
});

test("a presentation is refused without a seed, because an unreconstructible order is not a record", () => {
  /* This is the point of the module. A seed generated here would vanish with the process,
     and the attempt could never be replayed — so the caller must supply and store one. */
  assert.equal(presentAssessment(sample()), null);
  assert.equal(presentAssessment(sample(), ""), null);
  assert.equal(presentAssessment(sample(), 12345), null, "a number is not a stored seed");
  assert.equal(presentAssessment(null, "seed"), null);
});

test("the same seed always produces the same order", () => {
  const assessment = sample();
  const first = presentAssessment(assessment, "attempt-0001");
  const second = presentAssessment(assessment, "attempt-0001");
  assert.deepEqual(first.items.map((item) => item.id), second.items.map((item) => item.id));
  assert.deepEqual(first.presentationOrder, second.presentationOrder);
  assert.equal(first.presentationSeed, "attempt-0001");
});

test("different seeds produce different orders, which is what the Kansas rule asks for", () => {
  const assessment = sample(10);
  const orders = new Set();
  for (let index = 0; index < 40; index += 1) {
    orders.add(presentAssessment(assessment, `attempt-${index}`).items.map((item) => item.id).join(","));
  }
  assert.ok(orders.size > 20, `only ${orders.size} distinct orders across 40 seeds`);
});

test("a permutation is a permutation — every item appears exactly once", () => {
  for (const length of [1, 2, 5, 12, 50]) {
    for (const seed of ["a", "attempt-9", "zzz"]) {
      const order = permutationFor(length, seed);
      assert.equal(order.length, length);
      assert.deepEqual([...order].sort((a, b) => a - b), Array.from({ length }, (_, i) => i),
        `length ${length} seed ${seed} lost or duplicated an index`);
    }
  }
});

test("a recorded attempt replays to the exact order the student saw", () => {
  const assessment = sample(9);
  const presented = presentAssessment(assessment, "attempt-7f3a");
  for (const record of [{ presentation_seed: "attempt-7f3a" }, { presentationSeed: "attempt-7f3a" }]) {
    const replayed = replayPresentation(assessment, record);
    assert.deepEqual(replayed.items.map((item) => item.id), presented.items.map((item) => item.id));
    assert.deepEqual(replayed.presentationOrder, presented.presentationOrder);
  }
  assert.equal(replayPresentation(assessment, {}), null, "no seed means no replay, not a guess");
});

test("positional answers map back to item ids through the stored order", () => {
  const assessment = sample(4);
  const presented = presentAssessment(assessment, "attempt-2b");
  const mapped = answersByItemId(presented, [3, 1, 0, 2]);
  assert.deepEqual(Object.keys(mapped).sort(), ["item-1", "item-2", "item-3", "item-4"]);
  for (const [position, item] of presented.items.entries()) {
    assert.equal(mapped[item.id], [3, 1, 0, 2][position]);
  }
  assert.equal(answersByItemId(presented, [1, 2]), null, "a short answer set is rejected");
});

test("item order does not disturb choice order, and scoring survives the reorder", () => {
  /* The invariant the whole audit trail rests on: what a student selected keeps its
     meaning. Choice order stays keyed to the item id, so an item presented third scores
     exactly as it would have scored presented first. */
  for (const moduleId of ALASKA_MODULE_IDS) {
    const assessment = getAlaskaAssessment(moduleId, "engagement");
    const presented = presentAssessment(assessment, `attempt-${moduleId}`);

    const byId = new Map(assessment.items.map((item) => [item.id, item]));
    for (const item of presented.items) {
      const original = byId.get(item.id);
      assert.deepEqual(item.choices, original.choices, `${item.id} choices changed with item order`);
      assert.equal(item.correctChoice, original.correctChoice, `${item.id} correct index changed`);
    }

    const perfect = presented.items.map((item) => item.correctChoice);
    const scored = scoreAlaskaAssessment(presented, perfect);
    assert.equal(scored.percent, 100, `${moduleId} did not score against the presented order`);
    assert.deepEqual(
      scored.results.map((result) => result.itemId),
      presented.items.map((item) => item.id),
      "results must follow the presented order so a stored answer array lines up"
    );
  }
});

test("presentation adds no field that could leak an answer", () => {
  const assessment = getAlaskaAssessment("module-05", "engagement");
  const presented = presentAssessment(assessment, "attempt-leak-check");
  const added = Object.keys(presented).filter((key) => !(key in assessment));
  assert.deepEqual(added.sort(), ["presentationOrder", "presentationSeed"]);
  assert.equal(typeof presented.presentationSeed, "string");
  assert.ok(Array.isArray(presented.presentationOrder));
});
