#!/usr/bin/env node
/** Verify and summarize the secure Florida examination blueprint without rendering exam content. */
import {
  BLUEPRINT_STATUS,
  FORM_BLUEPRINTS,
  SECTION_ITEM_ALLOCATION,
  verifyExamBlueprint,
} from "../config/florida/secure-final-form-blueprint.mjs";

const verification = verifyExamBlueprint();
console.log("FL_COURSE_I_EXAM_BLUEPRINT");
console.log(`forms: ${BLUEPRINT_STATUS.plannedForms}`);
console.log(`items per form: ${BLUEPRINT_STATUS.plannedItemsPerForm}`);
console.log(`planned secure slots: ${BLUEPRINT_STATUS.plannedSlots}`);
console.log(`authored drafts assigned: ${BLUEPRINT_STATUS.draftedSlotsAssigned}`);
console.log(`unwritten slots: ${BLUEPRINT_STATUS.remainingAuthoringSlots}`);
console.log(`section allocation per form: ${SECTION_ITEM_ALLOCATION.map((row) => `${row.section}:${row.items}`).join(" ")}`);
for (const form of FORM_BLUEPRINTS) {
  const levels = Object.groupBy(form.slots, (slot) => slot.cognitiveLevel);
  console.log(`form ${form.form}: ${form.slots.length} slots; application ${levels.application.length}; comprehension ${levels.comprehension.length}; knowledge ${levels.knowledge.length}; generated NO`);
}
if (!verification.ok) {
  for (const failure of verification.failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
} else {
  console.log("BLUEPRINT VERIFIED — bank content and forms remain NO-GO");
}
