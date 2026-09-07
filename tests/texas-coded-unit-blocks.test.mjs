import test from "node:test";
import assert from "node:assert/strict";
import { parseModule } from "../scripts/lib/generate-complete-tx-block-maps.mjs";

const chapter = (first = "T01U1", second = "T01U2") => `# Module 01
## ${first} — Contract elements
Teaching.
### Applied exercise: Diagnose the offer
Exercise and feedback.
## ${second} — Acceptance
Teaching.
### Module recap
Review.
## Optional reference: Further reading
Optional material.
`;

test("coded Texas unit headings preserve explicit identity and segment exercises", () => {
  const parsed = parseModule(chapter(), ["T01U1", "T01U2"]);
  assert.deepEqual(parsed.blocks.map(b => b.code), ["T01U1", "T01U2"]);
  assert.equal(parsed.blocks[0].screens[1].type, "practice");
  assert.equal(parsed.blocks[0].screens[1].to, "## T01U2 — Acceptance");
  assert.equal(parsed.blocks[1].screens[0].to, "### Module recap");
  assert.ok(parsed.optionalMark);
});

test("same-count swapped, duplicated, or foreign-topic unit codes fail", () => {
  for (const [a, b] of [["T01U2", "T01U1"], ["T01U1", "T01U1"], ["T02U1", "T02U2"]]) {
    assert.throws(() => parseModule(chapter(a, b), ["T01U1", "T01U2"]), /out of order/);
  }
});

test("legacy Texas unit headers retain their existing screen ranges", () => {
  const legacy = chapter().replace(/## T01U\d — /g, "## Unit: ");
  const parsed = parseModule(legacy, ["T01U1", "T01U2"]);
  assert.equal(parsed.blocks[0].screens[0].from, "^");
  assert.equal(parsed.blocks[1].screens[0].from, "## Unit: Acceptance");
  assert.equal(parsed.blocks[0].screens.at(-1).questionId, "t01u1-q1");
});
