import assert from "node:assert/strict";
import { course, modules, allUnits } from "./course-blueprint.mjs";

assert.equal(allUnits.length, 75);
assert.equal(modules.reduce((sum, entry) => sum + entry.hours, 0), 75);
assert.equal(modules.filter((entry) => entry.type === "exam").reduce((sum, entry) => sum + entry.hours, 0), 3);
assert.equal(allUnits.filter((unit) => unit.type === "instruction").length, 72);
assert.equal(allUnits.filter((unit) => unit.type === "exam").length, 3);
assert.equal(new Set(allUnits.map((unit) => unit.title)).size, 75);
assert.equal(course.instructionalMinutesPerHour, 50);
assert.equal(course.passingPercent, 75);
assert.equal(course.productionExamQuestions, null);
console.log("North Carolina blueprint valid: 72 instructional hours + 3-hour proctored final = 75 course hours.");
