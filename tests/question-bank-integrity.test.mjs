import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/*
 * One structural standard applied to every question bank in the project.
 *
 * Each state's own test file checks that state's content — that the items say
 * what its regulator's text says, that the hours add up, that no item states a
 * period no source states. Those tests cannot check each other, so a rule one
 * state adopted did not reach the others: Arizona's bank was held to a
 * twenty-five character floor on prompts while fifteen one-line definition
 * prompts sat in the Alaska, California, Michigan, Oklahoma and Wisconsin
 * banks unchallenged. This file is where a bank-wide rule lives from now on.
 *
 * The banks do not share a shape. Colorado keys by module and splits each into
 * applied / engagement / remediation; California keys by lesson; Alaska keys by
 * module with a flat array. Rather than model each, the walk finds every object
 * carrying a prompt and a choices array, wherever it sits.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configRoot = path.join(root, "config");

const bankFiles = fs
  .readdirSync(configRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((entry) =>
    fs
      .readdirSync(path.join(configRoot, entry.name))
      .filter((file) => file.endsWith("question-bank.mjs"))
      .map((file) => path.join("config", entry.name, file)),
  )
  .sort();

const collectItems = (value, out = []) => {
  if (Array.isArray(value)) {
    for (const entry of value) collectItems(entry, out);
    return out;
  }
  if (value && typeof value === "object") {
    if (typeof value.prompt === "string" && Array.isArray(value.choices)) {
      out.push(value);
      return out;
    }
    for (const entry of Object.values(value)) collectItems(entry, out);
  }
  return out;
};

const banks = await Promise.all(
  bankFiles.map(async (file) => ({
    file,
    items: collectItems(Object.values(await import(path.join(root, file)))),
  })),
);

test("every question bank in the project is found and carries items", () => {
  assert.equal(bankFiles.length, 30, `expected 30 question banks, found ${bankFiles.length}: ${bankFiles.join(", ")}`);
  for (const bank of banks) {
    assert.ok(bank.items.length > 0, `${bank.file} yielded no items — its shape changed and this walk no longer reaches them`);
  }
});

/*
 * The correct answer is authored at index 0 in every bank and permuted at
 * delivery by a hash keyed to the item's id. If an author moves the answer, the
 * permutation still runs and the item still renders, so nothing visibly breaks
 * — the recorded selected_choice simply stops meaning what the record says it
 * means. Nothing else in the system can catch that.
 */
test("the correct answer is authored at index 0 in every bank", () => {
  for (const bank of banks) {
    for (const [index, item] of bank.items.entries()) {
      assert.equal(
        item.correctChoice,
        0,
        `${bank.file} item ${index} (${item.prompt.slice(0, 60)}) has correctChoice ${item.correctChoice}; every bank authors the answer at index 0`,
      );
    }
  }
});

test("every item offers at least three choices, all distinct and non-empty", () => {
  for (const bank of banks) {
    for (const item of bank.items) {
      assert.ok(
        item.choices.length >= 3,
        `${bank.file}: "${item.prompt.slice(0, 60)}" offers ${item.choices.length} choices`,
      );
      for (const choice of item.choices) {
        assert.equal(typeof choice, "string", `${bank.file}: "${item.prompt.slice(0, 60)}" has a non-string choice`);
        assert.ok(choice.trim().length > 0, `${bank.file}: "${item.prompt.slice(0, 60)}" has an empty choice`);
      }
      assert.equal(
        new Set(item.choices.map((choice) => choice.trim())).size,
        item.choices.length,
        `${bank.file}: "${item.prompt.slice(0, 60)}" repeats a choice, so two options are the same answer`,
      );
    }
  }
});

/*
 * Twenty-five characters is the floor Arizona's bank already met. It is short
 * enough that no substantive item is near it and long enough to exclude the
 * bare definition prompt — "What is commingling?" — which tests recall of a
 * word rather than whether the student can apply the rule.
 */
const MINIMUM_PROMPT_LENGTH = 25;

test("no item asks a question too short to require reasoning", () => {
  for (const bank of banks) {
    for (const item of bank.items) {
      assert.ok(
        item.prompt.trim().length >= MINIMUM_PROMPT_LENGTH,
        `${bank.file}: "${item.prompt}" is ${item.prompt.trim().length} characters, below the ${MINIMUM_PROMPT_LENGTH}-character floor`,
      );
    }
  }
});

test("every item carries a rationale substantial enough to teach from", () => {
  for (const bank of banks) {
    for (const item of bank.items) {
      assert.equal(typeof item.rationale, "string", `${bank.file}: "${item.prompt.slice(0, 60)}" has no rationale`);
      assert.ok(
        item.rationale.trim().length >= 20,
        `${bank.file}: "${item.prompt.slice(0, 60)}" has a ${item.rationale.trim().length}-character rationale`,
      );
    }
  }
});

/*
 * Within one bank a repeated prompt is a copy-paste that lost its edit: the two
 * items look distinct in the file and are the same question to the student.
 * Across banks a repeat is legitimate — a federal fair housing question belongs
 * in more than one state — so the check stays inside each bank.
 */
test("no bank asks the same question twice", () => {
  for (const bank of banks) {
    const seen = new Map();
    for (const item of bank.items) {
      const key = item.prompt.trim().toLowerCase();
      assert.equal(seen.has(key), false, `${bank.file} asks "${item.prompt.slice(0, 80)}" more than once`);
      seen.set(key, item);
    }
  }
});

test("no authored item claims the course or the school is approved", () => {
  /* The claim, not the subject: an item may teach what approval means. */
  const claims = [
    /\bthis course (is|has been) (state[- ])?approved\b/i,
    /\bStateCourse (is|has been) (state[- ])?approved\b/i,
    /\benroll now\b/i,
  ];
  for (const bank of banks) {
    for (const item of bank.items) {
      const text = [item.prompt, ...item.choices, item.rationale].join(" ");
      for (const claim of claims) {
        assert.equal(claim.test(text), false, `${bank.file}: "${item.prompt.slice(0, 60)}" claims approval: ${claim}`);
      }
    }
  }
});

test("the project's authored item count is what the state builds add up to", () => {
  const total = banks.reduce((sum, bank) => sum + bank.items.length, 0);
  /* 2026-08-28: 2464 + 32 — TX-1A added the Texas Principles I formative bank (32 primary items;
     its 32 replacement questions live inside the items and are deliberately outside this walk).
     2026-08-29: 2496 + 44 — Principles II's formative bank, on the same convention: 44 primary
     items, with their 44 replacements nested inside and outside this walk.
     2026-08-30: 2540 + 116 — the Texas Law of Agency formative bank. Both halves are counted this
     time, and deliberately: 58 primary items in TOPIC_QUIZZES and 58 replacement items in a
     separate top-level REPLACEMENTS export, because scripts/validate-loa-assessments.mjs reads the
     replacements as their own map to check that every primary has the successor question 22 TAC
     § 535.62(b)(7)(C)(ii) requires. They are 116 distinct objects with 116 distinct prompts, so the
     walk is counting items rather than copies — which is the failure this file's flat-view note
     warns about, and is why that bank exports its flat views as functions. */
  // 2026-09-07: PCF adds130, LOC162 and REF148 distinct primaries/related replacements.
  assert.equal(total, 3096, `the banks now hold ${total} items, not 3096; update this figure deliberately when a bank changes`);
});
