/**
 * Florida Course I secure end-course examination blueprint.
 *
 * This module plans the five 126-item forms StateCourse has chosen to prepare while DBPR's
 * two-versus-five form conflict and the 100-versus-126 item question remain open. It does not
 * manufacture examination content and it does not make an incomplete bank look complete.
 *
 * The blueprint deliberately targets zero question reuse between forms. Florida permits no more
 * than 15% duplication; zero is a StateCourse design target, not a new regulatory minimum. Every
 * slot identifies its syllabus objective, the page in the paginated curriculum that must support
 * the question and correct answer, and the cognitive level the eventual item must satisfy.
 */

import { SECTION_PLANS } from "./course-i-curriculum.mjs";
import {
  REGULATORY_MINIMUM_CONFIRMED,
  STATECOURSE_CONSERVATIVE_POLICY,
} from "./assessment-architecture.mjs";
import { SECURE_FINAL_DRAFT_ITEMS } from "./secure-final-bank-draft.mjs";

const FORM_NAMES = Object.freeze(["A", "B", "C", "D", "E"]);
const SECTION_ORDER = Object.freeze([14, 4, 18, 2, 11, 7, 16, 5, 13, 1, 9, 17, 3, 12, 6, 19, 8, 15, 10]);
const TARGETS = Object.freeze({ application: 89, comprehension: 25, knowledge: 12 });

const objectiveRecords = [];
let nextCurriculumPage = 1;
for (const section of SECTION_PLANS) {
  nextCurriculumPage += 1; // the section opening page
  for (const objective of section.learningObjectives) {
    objectiveRecords.push(Object.freeze({
      section: section.number,
      objective: `${section.number}.${objective.n}`,
      objectiveNumber: objective.n,
      objectiveText: objective.text,
      syllabusPage: objective.page,
      curriculumPage: nextCurriculumPage,
    }));
    nextCurriculumPage += 1;
  }
}

const objectivesBySection = new Map(SECTION_PLANS.map((section) => [
  section.number,
  objectiveRecords.filter((objective) => objective.section === section.number),
]));

/** Hamilton allocation preserves the syllabus's objective proportions and sums exactly to 126. */
function allocateItemsBySection(itemCount) {
  const totalObjectives = objectiveRecords.length;
  const rows = SECTION_PLANS.map((section) => {
    const exact = section.learningObjectives.length * itemCount / totalObjectives;
    return {
      section: section.number,
      objectiveCount: section.learningObjectives.length,
      exact,
      items: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });
  let remaining = itemCount - rows.reduce((sum, row) => sum + row.items, 0);
  for (const row of [...rows].sort((a, b) => b.remainder - a.remainder || a.section - b.section)) {
    if (remaining === 0) break;
    row.items += 1;
    remaining -= 1;
  }
  return Object.freeze(rows.map((row) => Object.freeze({
    section: row.section,
    objectiveCount: row.objectiveCount,
    items: row.items,
  })));
}

export const SECTION_ITEM_ALLOCATION = allocateItemsBySection(
  STATECOURSE_CONSERVATIVE_POLICY.itemCount.value,
);

const cognitiveLevelAt = (index) => {
  if (index % 10 === 9) return "knowledge";
  if (index % 5 === 2) return "comprehension";
  return "application";
};

const authoringDirection = Object.freeze({
  application: "Use a completely new and concrete Florida fact pattern; require application of the taught rule, method, law, policy, or computation.",
  comprehension: "Require classification, comparison, explanation, or inference; do not reduce the item to recall of a label.",
  knowledge: "Test a specific fact, term, method, rule, date, formula, or name that the assigned curriculum page expressly teaches.",
});

function selectedObjectives(sectionNumber, target, formIndex) {
  const objectives = objectivesBySection.get(sectionNumber);
  const offset = (formIndex * target) % objectives.length;
  return Array.from({ length: target }, (_, index) => objectives[(offset + index) % objectives.length]);
}

function interleavedObjectives(formIndex) {
  const allocations = new Map(SECTION_ITEM_ALLOCATION.map((row) => [row.section, row.items]));
  const queues = new Map(SECTION_ORDER.map((section) => [
    section,
    selectedObjectives(section, allocations.get(section), formIndex),
  ]));
  const rotated = SECTION_ORDER.map((_, index) => SECTION_ORDER[(index + formIndex * 4) % SECTION_ORDER.length]);
  const ordered = [];
  let anotherPass = true;
  while (anotherPass) {
    anotherPass = false;
    for (const section of rotated) {
      const next = queues.get(section).shift();
      if (next) {
        ordered.push(next);
        anotherPass = true;
      }
    }
  }
  return ordered;
}

const draftsByObjective = new Map(SECURE_FINAL_DRAFT_ITEMS.map((item) => [item.objective, item]));
const assignedDrafts = new Set();

export const FORM_BLUEPRINTS = Object.freeze(FORM_NAMES.map((form, formIndex) => {
  const objectives = interleavedObjectives(formIndex);
  const slots = objectives.map((objective, index) => {
    const level = cognitiveLevelAt(index);
    const draft = draftsByObjective.get(objective.objective);
    const useDraft = draft && level === "application" && !assignedDrafts.has(draft.id);
    if (useDraft) assignedDrafts.add(draft.id);
    return Object.freeze({
      slotId: `FL-F${form}-S${String(index + 1).padStart(3, "0")}`,
      plannedItemId: `FL-F${form}-I${String(index + 1).padStart(3, "0")}`,
      form,
      position: index + 1,
      section: objective.section,
      objective: objective.objective,
      objectiveText: objective.objectiveText,
      syllabusPage: objective.syllabusPage,
      curriculumPage: objective.curriculumPage,
      cognitiveLevel: level,
      authoringDirection: authoringDirection[level],
      itemState: useDraft ? "DRAFT_AUTHORED_UNREVIEWED" : "NOT_YET_AUTHORED",
      draftItemId: useDraft ? draft.id : null,
      choicesRequired: REGULATORY_MINIMUM_CONFIRMED.answerChoicesPerItem.value,
      pageReferencedKeyRequired: true,
      studentMaterialReferenceProhibited: true,
    });
  });
  return Object.freeze({
    form,
    policyItemCount: STATECOURSE_CONSERVATIVE_POLICY.itemCount.value,
    regulatoryMinimumItems: REGULATORY_MINIMUM_CONFIRMED.minimumItems.value,
    allottedMinutes: STATECOURSE_CONSERVATIVE_POLICY.allottedMinutes.value,
    answerKeyId: `FL-COURSE-I-FORM-${form}-KEY`,
    answerKeyGenerated: false,
    studentFormGenerated: false,
    releaseEnabled: false,
    slots: Object.freeze(slots),
  });
}));

const allSlots = FORM_BLUEPRINTS.flatMap((form) => form.slots);
const draftedSlots = allSlots.filter((slot) => slot.draftItemId);

export const BLUEPRINT_STATUS = Object.freeze({
  blueprintComplete: true,
  plannedForms: FORM_BLUEPRINTS.length,
  plannedItemsPerForm: STATECOURSE_CONSERVATIVE_POLICY.itemCount.value,
  plannedSlots: allSlots.length,
  draftedItemsAvailable: SECURE_FINAL_DRAFT_ITEMS.length,
  draftedSlotsAssigned: draftedSlots.length,
  remainingAuthoringSlots: allSlots.length - draftedSlots.length,
  additionalItemsForOneRegulatoryMinimumForm: Math.max(
    0,
    REGULATORY_MINIMUM_CONFIRMED.minimumItems.value - SECURE_FINAL_DRAFT_ITEMS.length,
  ),
  additionalItemsForOnePolicyForm: Math.max(
    0,
    STATECOURSE_CONSERVATIVE_POLICY.itemCount.value - SECURE_FINAL_DRAFT_ITEMS.length,
  ),
  bankContentComplete: false,
  formsReadyForAssembly: 0,
  crossFormDuplicationTargetPercent: 0,
  crossFormDuplicationTargetIsProviderPolicy: true,
  independentReviewComplete: false,
  finalPaginationLocked: false,
  publicationEnabled: false,
});

const normalise = (value) => String(value).toLowerCase().replaceAll(/[^a-z0-9]+/g, " ").trim();

export function verifyExamBlueprint() {
  const failures = [];
  const expectedForms = STATECOURSE_CONSERVATIVE_POLICY.formCount.value;
  const expectedItems = STATECOURSE_CONSERVATIVE_POLICY.itemCount.value;
  if (FORM_BLUEPRINTS.length !== expectedForms) failures.push(`forms ${FORM_BLUEPRINTS.length} != ${expectedForms}`);

  const slotIds = new Set();
  const plannedItemIds = new Set();
  for (const form of FORM_BLUEPRINTS) {
    if (form.slots.length !== expectedItems) failures.push(`form ${form.form} has ${form.slots.length} slots, expected ${expectedItems}`);
    const levels = Object.fromEntries(Object.keys(TARGETS).map((level) => [
      level,
      form.slots.filter((slot) => slot.cognitiveLevel === level).length,
    ]));
    for (const [level, expected] of Object.entries(TARGETS)) {
      if (levels[level] !== expected) failures.push(`form ${form.form} ${level} ${levels[level]} != ${expected}`);
    }
    if (levels.application / form.slots.length < REGULATORY_MINIMUM_CONFIRMED.minimumApplicationLevelPercent.value / 100) {
      failures.push(`form ${form.form} application share is below the regulatory minimum`);
    }
    if (levels.knowledge / form.slots.length > REGULATORY_MINIMUM_CONFIRMED.maximumKnowledgeLevelPercent.value / 100) {
      failures.push(`form ${form.form} knowledge share exceeds the regulatory maximum`);
    }
    const ordered = [...form.slots].sort((a, b) => a.section - b.section || a.objective.localeCompare(b.objective));
    if (form.slots.every((slot, index) => slot.slotId === ordered[index].slotId)) failures.push(`form ${form.form} follows course order`);
    const objectives = new Set();
    for (const slot of form.slots) {
      if (slotIds.has(slot.slotId)) failures.push(`duplicate slot id ${slot.slotId}`);
      if (plannedItemIds.has(slot.plannedItemId)) failures.push(`duplicate planned item id ${slot.plannedItemId}`);
      slotIds.add(slot.slotId);
      plannedItemIds.add(slot.plannedItemId);
      if (objectives.has(slot.objective)) failures.push(`form ${form.form} repeats objective ${slot.objective}`);
      objectives.add(slot.objective);
      if (!Number.isInteger(slot.curriculumPage) || slot.curriculumPage < 1) failures.push(`${slot.slotId} has no curriculum page`);
      if (slot.choicesRequired !== 4) failures.push(`${slot.slotId} does not require four choices`);
    }
  }

  const representedObjectives = new Set(allSlots.map((slot) => slot.objective));
  for (const objective of objectiveRecords) {
    if (!representedObjectives.has(objective.objective)) failures.push(`objective ${objective.objective} is absent from all forms`);
  }
  const draftAssignments = new Map();
  for (const slot of draftedSlots) draftAssignments.set(slot.draftItemId, (draftAssignments.get(slot.draftItemId) ?? 0) + 1);
  for (const draft of SECURE_FINAL_DRAFT_ITEMS) {
    if (draftAssignments.get(draft.id) !== 1) failures.push(`draft ${draft.id} assigned ${draftAssignments.get(draft.id) ?? 0} times`);
    if (draft.choices.length !== 4 || new Set(draft.choices.map(normalise)).size !== 4) failures.push(`draft ${draft.id} lacks four unique choices`);
    if (!Number.isInteger(draft.correctIndex) || draft.correctIndex < 0 || draft.correctIndex > 3) failures.push(`draft ${draft.id} has an invalid key`);
  }
  const stems = SECURE_FINAL_DRAFT_ITEMS.map((draft) => normalise(draft.stem));
  if (new Set(stems).size !== stems.length) failures.push("drafted bank repeats a stem");
  if (BLUEPRINT_STATUS.formsReadyForAssembly !== 0 || BLUEPRINT_STATUS.bankContentComplete) failures.push("incomplete bank represented as ready");
  if (FORM_BLUEPRINTS.some((form) => form.answerKeyGenerated || form.studentFormGenerated || form.releaseEnabled)) {
    failures.push("an incomplete form or key is represented as generated or released");
  }
  return Object.freeze({ ok: failures.length === 0, failures: Object.freeze(failures) });
}

export default Object.freeze({ SECTION_ITEM_ALLOCATION, FORM_BLUEPRINTS, BLUEPRINT_STATUS, verifyExamBlueprint });
