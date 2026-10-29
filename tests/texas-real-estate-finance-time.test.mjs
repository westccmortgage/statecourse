import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { RATES, BUDGET, TOTALS } from "../config/texas/real-estate-finance-time-budget.mjs";

const dir = path.resolve("texas/tx-real-estate-finance-30-v1/curriculum");
const moduleFor = code => fs.readFileSync(path.join(dir, `module-${code.slice(1)}.md`), "utf8");

test("REF budget inventory matches the exercises actually authored in each module", () => {
  for (const b of BUDGET) {
    const text = moduleFor(b.topicCode);
    assert.equal((text.match(/^### Statute reading exercise:/gm) || []).length, b.statuteReadingExercises, `${b.topicCode} statute exercises`);
    assert.equal((text.match(/^### Applied exercise:/gm) || []).length, b.appliedExercises, `${b.topicCode} applied exercises`);
  }
});

test("every REF topic's supported minutes reach its prescribed REF-0 minutes", () => {
  let supported = 0;
  for (const b of BUDGET) {
    const words = moduleFor(b.topicCode).split(/\s+/).filter(Boolean).length;
    const minutes = b.activityMinutes + Math.round(words / RATES.firstPassWordsPerMinute);
    supported += minutes;
    assert.ok(minutes >= b.prescribedMinutes, `${b.topicCode}: ${minutes} supported < ${b.prescribedMinutes} prescribed`);
  }
  assert.equal(TOTALS.budgetedMinutes, 1500);
  assert.ok(supported >= 1500);
});

test("the mutation is caught: removing an applied exercise breaks the inventory", () => {
  const b = BUDGET.find(x => x.topicCode === "T10");
  const text = moduleFor("T10").replace(/^### Applied exercise: A85[\s\S]*?(?=^## )/m, "");
  assert.notEqual((text.match(/^### Applied exercise:/gm) || []).length, b.appliedExercises);
});
