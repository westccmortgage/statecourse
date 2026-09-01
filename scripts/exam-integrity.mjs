#!/usr/bin/env node
/*
 * The four examination gates.
 *
 * RE 303 asks for four documents per course — a student version, an instructor version with an
 * answer key that references where in the course material each answer is found, and the
 * instructions for the student and for the proctor — and permits one retake "on different
 * questions". Four sentences, and every one of them is a property somebody has to be able to
 * check rather than assert.
 *
 * That is what these gates are for. Each is named for the property it holds, and each fails
 * loudly rather than reporting a percentage:
 *
 *   NO_UNSOURCED_EXAM_QUESTIONS
 *     Every item names the assignment and the numbered subsection its answer comes from. An
 *     item without one cannot be defended to a reviewer who asks where it is taught, and an
 *     item that cannot be defended should not be on the examination.
 *
 *   NO_DUPLICATE_A_B_QUESTIONS
 *     "One retake on different questions" means different questions. A form that reordered the
 *     same hundred items, or reworded them around the same correct proposition at the same
 *     subsection, would satisfy the letter of a naive check and none of the purpose: the
 *     retake exists so that a student who failed has to know the material rather than to
 *     remember which letter they picked. So the check runs three ways — the same prompt, the
 *     same correct answer at the same subsection, and the same set of choices.
 *
 *   100_PERCENT_ANSWER_KEY_TRACEABILITY
 *     Every reference resolves. Not "looks like a section number" — resolves, to a heading that
 *     exists in the lesson file a student actually reads. A reference to section 6.9 of an
 *     assignment that stops at 6.8 is worse than no reference, because it reads as diligence.
 *
 *   100_PERCENT_REQUIRED_TOPIC_COVERAGE
 *     Every assignment is examined on every form, and every topic the course declares is
 *     examined somewhere. The coverage rule is stated in full below rather than left to be
 *     inferred from whatever the banks happen to contain.
 *
 * The gates read the authored banks — the same modules the portal serves from — rather than the
 * generated markdown, and then check that the generated markdown agrees with them. Checking the
 * documents alone would pass a packet that had drifted from the examination students sit, which
 * is the one disagreement a reviewer comparing the two would certainly find.
 *
 * Usage:  node scripts/exam-integrity.mjs [--json]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ACADEMIC_CONTROLS, PROGRAMS } from "../config/california/regulatory-manifest.mjs";
import { PROVIDER } from "../config/california/submission-facts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_JSON = process.argv.includes("--json");

/*
 * THE COVERAGE RULE, STATED
 *
 * An assignment must be examined on EVERY form. A student who fails and retakes sits Form B
 * alone, and a form that skipped an assignment would examine that student on fourteen
 * assignments out of fifteen.
 *
 * A topic must be examined on SOME form. Requiring all ninety topics on each form would demand
 * at least ninety single-topic items per form before any integrative item, which is a different
 * examination from the one RE 303 describes and not a better one. Across the two forms, every
 * topic the course declares is examined.
 */
const MINIMUM_ITEMS_PER_ASSIGNMENT_PER_FORM = 6;

const BANKS = {
  "ca-real-estate-principles-45": "config/california/principles-final-exam-bank.mjs",
  "ca-real-estate-practice-45": "config/california/practice-final-exam-bank.mjs",
  "ca-mortgage-loan-brokering-lending-45": "config/california/mortgage-final-exam-bank.mjs",
};

/* Whitespace, punctuation and case are not what makes two questions the same question. */
const normalise = (text) =>
  String(text)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim();

const assignmentNumber = (assignmentId) => Number(String(assignmentId).replace("assignment-", ""));

/* The course's own declared structure: `## N. Title` is a topic, `### N.M` is a subsection an
   item may cite. Both come from the lesson file the student reads, so neither can be satisfied
   by a heading that exists only in an outline. */
function courseStructure(program) {
  const topics = [];
  const subsections = new Map();
  for (let index = 1; index <= ACADEMIC_CONTROLS.minimumLessonAssignments; index += 1) {
    const number = String(index).padStart(2, "0");
    const assignmentId = `assignment-${number}`;
    const file = path.join(root, `california/${program.courseId}/curriculum/lesson-${number}.md`);
    if (!fs.existsSync(file)) throw new Error(`${program.title}: ${file} does not exist`);
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/^##\s+(\d+)\.\s+(.+)$/gm)) {
      topics.push({ assignmentId, topic: match[1], title: match[2].trim() });
    }
    subsections.set(assignmentId, new Set([...text.matchAll(/^#{3}\s+(\d+\.\d+)/gm)].map((match) => match[1])));
  }
  return { topics, subsections };
}

const failures = { unsourced: [], duplicate: [], traceability: [], coverage: [], documents: [] };
const counts = { items: 0, forms: 0, topics: 0 };

for (const program of PROGRAMS) {
  const bankPath = BANKS[program.catalogId];
  if (!bankPath) {
    failures.traceability.push(`${program.title}: no examination bank is registered for ${program.catalogId}`);
    continue;
  }
  const bank = (await import(path.join(root, bankPath))).default;
  const structure = courseStructure(program);
  counts.topics += structure.topics.length;

  const forms = Object.entries(bank.forms);
  for (const [form, items] of forms) {
    counts.forms += 1;
    counts.items += items.length;

    /* RE 303 fixes the length; a bank that had drifted shorter would still pass every other
       gate here, so the count is checked where the items are read. */
    if (items.length !== ACADEMIC_CONTROLS.finalExamMinimumQuestions) {
      failures.coverage.push(
        `${program.title} form ${form}: ${items.length} items, and RE 303 requires not less than ${ACADEMIC_CONTROLS.finalExamMinimumQuestions}`,
      );
    }

    const perAssignment = new Map();
    for (const [index, item] of items.entries()) {
      const where = `${program.title} form ${form} item ${index + 1}`;

      /* ── NO_UNSOURCED_EXAM_QUESTIONS ── */
      const source = item.source;
      if (!source || !source.assignment || !source.section) {
        failures.unsourced.push(`${where}: names no assignment and subsection`);
        continue;
      }
      if (!item.rationale || item.rationale.length < 40) {
        failures.unsourced.push(`${where}: carries no rationale a reviewer could read`);
      }

      /* ── 100_PERCENT_ANSWER_KEY_TRACEABILITY ── */
      const known = structure.subsections.get(source.assignment);
      if (!known) {
        failures.traceability.push(`${where}: cites ${source.assignment}, which is not an assignment of this course`);
      } else if (!known.has(String(source.section))) {
        failures.traceability.push(
          `${where}: cites ${source.assignment} section ${source.section}, which does not exist in the lesson a student reads`,
        );
      }

      /* The correct answer is authored at index 0 and permuted at serve time. An item whose
         correctChoice is not 0 in the bank has been hand-edited, and the permutation would
         then serve the wrong answer as correct. */
      if (item.correctChoice !== 0) {
        failures.traceability.push(`${where}: the correct answer is authored at index ${item.correctChoice}, not 0`);
      }
      if (!Array.isArray(item.choices) || item.choices.length < 4) {
        failures.traceability.push(`${where}: has ${item.choices?.length ?? 0} choices`);
      } else if (new Set(item.choices.map(normalise)).size !== item.choices.length) {
        failures.traceability.push(`${where}: repeats a choice, so one distractor is the answer`);
      }

      const key = source.assignment;
      perAssignment.set(key, (perAssignment.get(key) ?? 0) + 1);
    }

    /* ── NO_DUPLICATE_A_B_QUESTIONS, within a form ── */
    const prompts = items.map((item) => normalise(item.prompt));
    const seen = new Map();
    for (const [index, prompt] of prompts.entries()) {
      if (seen.has(prompt)) failures.duplicate.push(`${program.title} form ${form}: items ${seen.get(prompt) + 1} and ${index + 1} ask the same question`);
      else seen.set(prompt, index);
    }

    /* ── 100_PERCENT_REQUIRED_TOPIC_COVERAGE, per form ── */
    for (let index = 1; index <= ACADEMIC_CONTROLS.minimumLessonAssignments; index += 1) {
      const assignmentId = `assignment-${String(index).padStart(2, "0")}`;
      const found = perAssignment.get(assignmentId) ?? 0;
      if (found < MINIMUM_ITEMS_PER_ASSIGNMENT_PER_FORM) {
        failures.coverage.push(
          `${program.title} form ${form}: ${assignmentId} carries ${found} items, below the ${MINIMUM_ITEMS_PER_ASSIGNMENT_PER_FORM} the coverage rule requires`,
        );
      }
    }
  }

  /* ── NO_DUPLICATE_A_B_QUESTIONS, across the forms ── */
  const [[formOne, itemsOne], [formTwo, itemsTwo]] = forms;
  const promptsOne = new Map(itemsOne.map((item, index) => [normalise(item.prompt), index]));
  const propositionOne = new Map(
    itemsOne.map((item, index) => [`${item.source.assignment}/${item.source.section}::${normalise(item.choices[item.correctChoice])}`, index]),
  );
  const choicesOne = new Map(itemsOne.map((item, index) => [[...item.choices].map(normalise).sort().join("|"), index]));
  for (const [index, item] of itemsTwo.entries()) {
    const label = `${program.title}: form ${formTwo} item ${index + 1}`;
    const prompt = normalise(item.prompt);
    if (promptsOne.has(prompt)) {
      failures.duplicate.push(`${label} is form ${formOne} item ${promptsOne.get(prompt) + 1}, reordered`);
    }
    const proposition = `${item.source.assignment}/${item.source.section}::${normalise(item.choices[item.correctChoice])}`;
    if (propositionOne.has(proposition)) {
      failures.duplicate.push(
        `${label} tests the same correct proposition at the same subsection as form ${formOne} item ${propositionOne.get(proposition) + 1}`,
      );
    }
    const choiceSet = [...item.choices].map(normalise).sort().join("|");
    if (choicesOne.has(choiceSet)) {
      failures.duplicate.push(`${label} offers the same four choices as form ${formOne} item ${choicesOne.get(choiceSet) + 1}, shuffled`);
    }
  }

  /* ── 100_PERCENT_REQUIRED_TOPIC_COVERAGE, across the forms ── */
  const examined = new Set(
    forms.flatMap(([, items]) => items.map((item) => `${item.source.assignment}/${String(item.source.section).split(".")[0]}`)),
  );
  for (const topic of structure.topics) {
    if (!examined.has(`${topic.assignmentId}/${topic.topic}`)) {
      failures.coverage.push(
        `${program.title}: ${topic.assignmentId} topic ${topic.topic} (${topic.title}) is taught and examined on neither form`,
      );
    }
  }

  /* ── the printed documents say what the banks say ── */
  const dir = path.join(root, `california/${program.courseId}/submission`);
  for (const [form, items] of forms) {
    const letter = form.toLowerCase();
    for (const [suffix, secure] of [["student", false], ["answer-key", true]]) {
      const file = path.join(dir, `final-exam-form-${letter}-${suffix}.md`);
      if (!fs.existsSync(file)) {
        failures.documents.push(`${program.title} form ${form}: ${suffix} document does not exist`);
        continue;
      }
      const text = fs.readFileSync(file, "utf8");
      const printed = [...text.matchAll(/^(?:\*\*|### )(\d+)\.(?:\*\*)? (.+)$/gm)];
      if (printed.length !== items.length) {
        failures.documents.push(`${program.title} form ${form} ${suffix}: prints ${printed.length} items against ${items.length} authored`);
      }
      /* The provider's legal name, in a document that goes to the Department. "StateCourse"
         and "StateCourse LLC" are not the same entity, and RE 336 was corrected for exactly
         this a fortnight ago; the examination documents were not. */
      if (!text.includes(PROVIDER.legalName)) {
        failures.documents.push(`${program.title} form ${form} ${suffix}: does not name ${PROVIDER.legalName}`);
      }
      if (secure && !/SECURE DOCUMENT/i.test(text)) {
        failures.documents.push(`${program.title} form ${form}: the answer key is not marked secure`);
      }
      if (!secure && /Correct answer:/i.test(text)) {
        failures.documents.push(`${program.title} form ${form}: the student version carries the answer key`);
      }
    }
  }
}

/* ── report ───────────────────────────────────────────────────────────────────────────── */

const GATES = [
  ["NO_UNSOURCED_EXAM_QUESTIONS", failures.unsourced],
  ["NO_DUPLICATE_A_B_QUESTIONS", failures.duplicate],
  ["100_PERCENT_ANSWER_KEY_TRACEABILITY", failures.traceability],
  ["100_PERCENT_REQUIRED_TOPIC_COVERAGE", failures.coverage],
  ["EXAM_DOCUMENTS_MATCH_THE_BANK", failures.documents],
];
const broken = GATES.filter(([, list]) => list.length > 0);

if (AS_JSON) {
  console.log(
    JSON.stringify(
      {
        counts,
        gates: Object.fromEntries(GATES.map(([name, list]) => [name, { pass: list.length === 0, failures: list }])),
        pass: broken.length === 0,
      },
      null,
      2,
    ),
  );
} else {
  console.log(`\n  California final examinations — ${counts.items} items across ${counts.forms} forms, ${counts.topics} declared topics\n`);
  for (const [name, list] of GATES) {
    console.log(`  ${list.length === 0 ? "PASS" : "FAIL"}  ${name}${list.length === 0 ? "" : ` — ${list.length}`}`);
    for (const failure of list.slice(0, 12)) console.log(`          ${failure}`);
    if (list.length > 12) console.log(`          ... and ${list.length - 12} more`);
  }
  console.log("");
}

process.exit(broken.length === 0 ? 0 : 1);
