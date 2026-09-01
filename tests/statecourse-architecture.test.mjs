import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../public/statecourse/", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("national registry contains all 50 states plus Washington, D.C. and controlled statuses", async () => {
  const registry = JSON.parse(await read("data/state-registry.json"));
  assert.equal(registry.states.length, 51);
  assert.equal(new Set(registry.states.map((state) => state.state_code)).size, 51);
  for (const state of registry.states) assert.ok(registry.statuses.includes(state.public_status));
});

test("every catalogue course remains a distinct, unapproved product", async () => {
  const catalog = JSON.parse(await read("data/course-catalog.json"));
  const courses = catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => program.courses ?? []);
  const virginia = courses.find((course) => course.state_id === "VA");
  const maine = courses.find((course) => course.state_id === "ME");
  const wisconsin = courses.find((course) => course.course_id === "wi-salesperson");
  const missouri48 = courses.find((course) => course.course_id === "mo-salesperson-preexam-48");
  const missouri24 = courses.find((course) => course.course_id === "mo-real-estate-practice-24");
  const oklahoma = courses.find((course) => course.course_id === "ok-basic-prelicense-90");
  /* Counted rather than pinned to a number: a course is added when a state's rules
     have been read and its curriculum written, and the invariant that matters is that
     every one of them is distinct and unapproved, not how many there are. */
  assert.equal(new Set(courses.map((course) => course.course_id)).size, courses.length,
    "two catalogue courses share a course_id");
  assert.ok(courses.length >= 22, `expected at least 22 catalogue courses, found ${courses.length}`);
  for (const course of courses) {
    assert.equal(course.enrollment_enabled, false, `${course.course_id} has enrollment enabled`);
    assert.equal(course.approval_number ?? null, null, `${course.course_id} carries an approval number`);
  }
  assert.equal(virginia.required_hours, 60);
  assert.equal(maine.required_hours, 55);
  assert.equal(virginia.enrollment_enabled, false);
  assert.equal(maine.enrollment_enabled, false);
  assert.notEqual(virginia.course_id, maine.course_id);
  assert.notEqual(virginia.route, maine.route);
  assert.equal(wisconsin.required_hours, 72);
  assert.equal(missouri48.required_hours, 48);
  assert.equal(missouri24.required_hours, 24);
  assert.equal(oklahoma.required_hours, 90);
  for (const course of courses) assert.equal(course.enrollment_enabled, false);
});

test("national homepage does not lead with Virginia", async () => {
  const homepage = await read("index.html");
  assert.match(homepage, /Real Estate Licensing/);
  assert.match(homepage, /State by State/);
  assert.match(homepage, /id="licensing-finder"/);
  assert.match(homepage, /My Courses/);
  assert.match(homepage, /href="https:\/\/statecourse\.com\/student\/sign-in\/"/);
  assert.match(homepage, /href="https:\/\/statecourse\.com\/student\/register\/"/);
  assert.doesNotMatch(homepage, /href="student\/(?:register\/|sign-in\/)?"/);
});

test("generated national pages use the canonical operational student portal", async () => {
  for (const route of ["get-licensed/index.html", "my-statecourse/index.html", "real-estate/california/index.html"]) {
    const html = await read(route);
    assert.match(html, /https:\/\/statecourse\.com\/student\/sign-in\//);
    assert.match(html, /https:\/\/statecourse\.com\/student\/register\//);
    assert.doesNotMatch(html, /href="(?:\.\.\/)+student\//);
  }
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
  const routes = [
    ["real-estate/wisconsin/pre-license/salesperson/index.html", /Wisconsin Salesperson Pre-License/, /72 hours/],
    ["real-estate/missouri/pre-license/salesperson-pre-exam/index.html", /Missouri Salesperson Pre-Exam Course/, /48 hours/],
    ["real-estate/missouri/pre-license/real-estate-practice/index.html", /Missouri Real Estate Practice Course/, /24 hours/],
    ["real-estate/oklahoma/pre-license/basic/index.html", /Oklahoma Basic Pre-License/, /90 hours/],
  ];
  for (const [route, title, hours] of routes) {
    const html = await read(route);
    assert.match(html, title);
    assert.match(html, hours);
    assert.match(html, /Enrollment.*disabled|Enrollment, payment.*disabled/is);
  }
});

test("secure Maine exam and answer materials are never referenced by public assets", async () => {
  const publicFiles = await Promise.all([
    read("index.html"), read("catalog.js"), read("maine-course.js"),
    read("real-estate/maine/pre-license/sales-agent/index.html"),
  ]);
  assert.doesNotMatch(publicFiles.join("\n"), /final-exam-bank\.md|assessments\/quizzes\.md|answer key/i);
});

test("development status tracks the catalogue exactly, nothing is approved, and the rest are honestly labelled", async () => {
  const registry = JSON.parse(await read("data/state-registry.json"));
  const catalog = JSON.parse(await read("data/course-catalog.json"));
  const catalogStates = new Set(
    catalog.categories
      .flatMap((category) => category.programs ?? [])
      .flatMap((program) => program.courses ?? [])
      .map((course) => course.state_id)
  );
  const launch = new Set(
    registry.states.filter((state) => state.public_status === "In Development").map((state) => state.state_code)
  );

  /* Pinning the list turned adding a state into a failure that said nothing about
     honesty. The invariant that actually matters is the coupling in both directions:
     a state claims development only where a course record exists, and a state with a
     course record does not understate its status. Adding a state satisfies both or
     fails loudly. */
  assert.deepEqual([...launch].sort(), [...catalogStates].sort(),
    "every In Development state must have a catalogue course, and every catalogue course a development state");
  assert.ok(launch.size > 0, "the launch set must not be empty");

  const others = registry.states.filter((state) => state.public_status !== "In Development");
  assert.equal(others.length, registry.states.length - launch.size);
  for (const state of others) {
    assert.ok(["Coming Soon", "In Research", "Not Started"].includes(state.public_status),
      `${state.state_code} carries an unexpected public status: ${state.public_status}`);
  }
  for (const state of registry.states) {
    assert.notEqual(state.public_status, "Approved", `${state.state_code} claims approval`);
    assert.equal(state.provider_approval_number ?? null, null, `${state.state_code} carries a provider approval number`);
  }
});

test("national routes and jurisdiction hubs are generated", async () => {
  for (const route of ["get-licensed/index.html", "state-requirements/index.html", "courses/index.html", "exam-prep/index.html", "continuing-education/index.html", "resources/index.html", "blog/index.html", "my-statecourse/index.html", "real-estate/california/index.html", "real-estate/district-of-columbia/index.html"]) {
    const html = await read(route);
    assert.match(html, /StateCourse/);
  }
});
