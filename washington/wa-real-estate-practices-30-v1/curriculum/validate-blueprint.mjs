import assert from "node:assert/strict";
import { course, modules, allUnits } from "./course-blueprint.mjs";

assert.equal(allUnits.length, 30);
assert.equal(modules.reduce((sum, entry) => sum + entry.hours, 0), 30);
for (const entry of modules) assert.equal(entry.topics.length, entry.hours, `${entry.id} topic count`);
assert.equal(new Set(allUnits.map((unit) => unit.title)).size, 30);
assert.equal(new Set(allUnits.map((unit) => unit.objective)).size, 30);
assert.equal(course.instructionalMinutesPerHour, 50);
assert.equal(course.finalExamQuestions, 90);
assert.equal(course.passingPercent, 70);
console.log("Washington Practices blueprint valid: 30 units; 90-question final specification; 70% pass.");
