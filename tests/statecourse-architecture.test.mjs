import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../public/statecourse/", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("national registry contains all 50 states and controlled statuses", async () => {
  const registry = JSON.parse(await read("data/state-registry.json"));
  assert.equal(registry.states.length, 50);
  assert.equal(new Set(registry.states.map((state) => state.state_code)).size, 50);
  for (const state of registry.states) assert.ok(registry.statuses.includes(state.public_status));
});

test("Virginia and Maine remain distinct unapproved course products", async () => {
  const catalog = JSON.parse(await read("data/course-catalog.json"));
  const courses = catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => program.courses ?? []);
  const virginia = courses.find((course) => course.state_id === "VA");
  const maine = courses.find((course) => course.state_id === "ME");
  assert.equal(virginia.required_hours, 60);
  assert.equal(maine.required_hours, 55);
  assert.equal(virginia.enrollment_enabled, false);
  assert.equal(maine.enrollment_enabled, false);
  assert.notEqual(virginia.course_id, maine.course_id);
  assert.notEqual(virginia.route, maine.route);
});

test("national homepage does not lead with Virginia", async () => {
  const homepage = await read("index.html");
  assert.match(homepage, /Your real estate license starts with the right state course/);
  assert.match(homepage, /Professional pathways/);
  assert.match(homepage, /id="state-directory"/);
  assert.ok(homepage.indexOf("Your real estate license") < homepage.indexOf('class="finder-code">VA'));
});

test("state course routes expose state-specific academic records", async () => {
  const virginia = await read("real-estate/virginia/pre-license/principles-and-practices/index.html");
  const maine = await read("real-estate/maine/pre-license/sales-agent/index.html");
  assert.match(virginia, /60-Hour Online Course/);
  assert.match(virginia, /Virginia Real Estate Board status/);
  assert.doesNotMatch(virginia, /Maine Real Estate Commission status/);
  assert.match(maine, /55-Hour Online Distance-Education Course/);
  assert.match(maine, /Maine Real Estate Commission status/);
  assert.doesNotMatch(maine, /Virginia Real Estate Board status/);
});

test("secure Maine exam and answer materials are never referenced by public assets", async () => {
  const publicFiles = await Promise.all([
    read("index.html"), read("catalog.js"), read("maine-course.js"),
    read("real-estate/maine/pre-license/sales-agent/index.html"),
  ]);
  assert.doesNotMatch(publicFiles.join("\n"), /final-exam-bank\.md|assessments\/quizzes\.md|answer key/i);
});
