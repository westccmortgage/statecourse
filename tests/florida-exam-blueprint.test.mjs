import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { SECTION_PLANS } from "../config/florida/course-i-curriculum.mjs";
import { SECURE_FINAL_DRAFT_ITEMS } from "../config/florida/secure-final-bank-draft.mjs";
import {
  BLUEPRINT_STATUS,
  FORM_BLUEPRINTS,
  SECTION_ITEM_ALLOCATION,
  verifyExamBlueprint,
} from "../config/florida/secure-final-form-blueprint.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allSlots = FORM_BLUEPRINTS.flatMap((form) => form.slots);

test("the current two-form secure blueprint verifies as a blueprint, not as a completed bank", () => {
  assert.deepEqual(verifyExamBlueprint(), { ok: true, failures: [] });
  assert.equal(BLUEPRINT_STATUS.blueprintComplete, true);
  assert.equal(BLUEPRINT_STATUS.bankContentComplete, false);
  assert.equal(BLUEPRINT_STATUS.formsReadyForAssembly, 0);
});

test("two current-form-required forms carry 126 unique secure slots each", () => {
  assert.equal(FORM_BLUEPRINTS.length, 2);
  assert.equal(allSlots.length, 252);
  assert.equal(new Set(allSlots.map((slot) => slot.slotId)).size, 252);
  assert.equal(new Set(allSlots.map((slot) => slot.plannedItemId)).size, 252);
  for (const form of FORM_BLUEPRINTS) assert.equal(form.slots.length, 126);
});

test("each form meets the planned cognitive distribution", () => {
  for (const form of FORM_BLUEPRINTS) {
    const count = (level) => form.slots.filter((slot) => slot.cognitiveLevel === level).length;
    assert.equal(count("application"), 89);
    assert.equal(count("comprehension"), 25);
    assert.equal(count("knowledge"), 12);
    assert.ok(count("application") / form.slots.length >= 0.70);
    assert.ok(count("knowledge") / form.slots.length <= 0.10);
  }
});

test("section allocation is proportional, exact, and present on every form", () => {
  assert.equal(SECTION_ITEM_ALLOCATION.reduce((sum, row) => sum + row.items, 0), 126);
  assert.deepEqual(SECTION_ITEM_ALLOCATION.map((row) => row.items), [5, 8, 5, 7, 6, 6, 7, 6, 6, 7, 8, 6, 7, 7, 4, 11, 6, 6, 8]);
  for (const form of FORM_BLUEPRINTS) {
    for (const row of SECTION_ITEM_ALLOCATION) {
      assert.equal(form.slots.filter((slot) => slot.section === row.section).length, row.items);
    }
  }
});

test("all 180 objectives are represented across forms and no form repeats one", () => {
  const expected = new Set(SECTION_PLANS.flatMap((section) => section.learningObjectives.map((objective) => `${section.number}.${objective.n}`)));
  assert.deepEqual(new Set(allSlots.map((slot) => slot.objective)), expected);
  for (const form of FORM_BLUEPRINTS) assert.equal(new Set(form.slots.map((slot) => slot.objective)).size, 126);
});

test("every blueprint page resolves to the canonical curriculum page map", () => {
  const pageMap = JSON.parse(fs.readFileSync(path.join(ROOT, "florida/fl-sales-associate-course-i-63-v1/curriculum-page-map.json"), "utf8"));
  const byObjective = new Map(pageMap.pages.map((row) => [row.objective, row.curriculumPage]));
  for (const slot of allSlots) assert.equal(slot.curriculumPage, byObjective.get(slot.objective), slot.slotId);
});

test("the nineteen existing drafts occupy one application slot each", () => {
  const drafted = allSlots.filter((slot) => slot.draftItemId);
  assert.equal(drafted.length, 19);
  assert.deepEqual(new Set(drafted.map((slot) => slot.draftItemId)), new Set(SECURE_FINAL_DRAFT_ITEMS.map((item) => item.id)));
  for (const slot of drafted) assert.equal(slot.cognitiveLevel, "application");
  assert.equal(BLUEPRINT_STATUS.remainingAuthoringSlots, 233);
  assert.equal(BLUEPRINT_STATUS.slotsRetiredIf100ItemsConfirmed, 52);
  assert.equal(BLUEPRINT_STATUS.remainingAuthoringSlotsIf100ItemsConfirmed, 181);
});

test("no incomplete student form, key, release, or unsupported readiness is generated", () => {
  for (const form of FORM_BLUEPRINTS) {
    assert.equal(form.studentFormGenerated, false);
    assert.equal(form.answerKeyGenerated, false);
    assert.equal(form.releaseEnabled, false);
  }
  const document = fs.readFileSync(path.join(ROOT, "florida/fl-sales-associate-course-i-63-v1/submission/exam-form-blueprint.md"), "utf8");
  assert.match(document, /NO-GO/);
  assert.match(document, /233/);
  assert.doesNotMatch(document, /Correct answer:/i);
});
