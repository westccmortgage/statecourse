import assert from "node:assert/strict";
import { course, modules, allUnits } from "./course-blueprint.mjs";

assert.equal(allUnits.length, 90, "course must contain exactly 90 instructional units");
assert.equal(modules.reduce((sum, module) => sum + module.hours, 0), 90, "module hours must total 90");
for (const module of modules) assert.equal(module.topics.length, module.hours, `${module.id} topic count must equal hours`);
assert.equal(allUnits.filter((unit) => unit.moduleLayer === "national_core").length, 63, "National Core must contain 63 units");
assert.equal(allUnits.filter((unit) => unit.moduleLayer === "arizona_specific").length, 27, "Arizona layer must contain 27 units");
assert.equal(new Set(allUnits.map((unit) => unit.title)).size, 90, "unit titles must be unique");
assert.equal(new Set(allUnits.map((unit) => unit.objective)).size, 90, "unit objectives must be unique");
assert.equal(course.instructionalMinutesPerHour, 50);
assert.equal(course.finalExamMinutesIncluded, false);
console.log("Arizona blueprint valid: 90 units = 63 National Core + 27 Arizona-specific; final excluded.");
