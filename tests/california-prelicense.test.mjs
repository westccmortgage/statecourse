import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const courses = ["ca-real-estate-principles-45-v1", "ca-real-estate-practice-45-v1", "ca-mortgage-loan-brokering-lending-45-v1"];

test("California is the eleventh in-development state with three separate courses", () => {
  const registry = read("public/statecourse/data/state-registry.json");
  assert.equal(registry.states.filter((s) => s.public_status === "In Development").length, 11);
  const ca = registry.states.find((s) => s.state_code === "CA");
  assert.equal(ca.course_ids.length, 3);
  assert.equal(ca.provider_status, "In Development");
});

for (const id of courses) test(id + " has California correspondence controls and complete package", () => {
  const c = read("california/" + id + "/lms-config.json");
  assert.equal(c.required_hours, 45);
  assert.equal(c.lesson_assignments, 15);
  assert.equal(c.minimum_elapsed_hours, 420);
  assert.equal(c.maximum_completion_days, 365);
  assert.deepEqual(c.cross_course_completion_rule, { maximum_courses: 2, window_days: 35, student_attestation_of_other_school_completions: true });
  assert.equal(c.final_exam.questions_per_form, 100);
  assert.equal(c.final_exam.forms, 2);
  assert.equal(c.final_exam.passing_percent, 60);
  assert.equal(c.approved, false);
  assert.equal(c.enrollment_enabled, false);
  for (let i = 1; i <= 15; i++) assert.ok(fs.existsSync("california/" + id + "/curriculum/lesson-" + String(i).padStart(2, "0") + ".md"));
  for (const form of ["a", "b"]) for (const version of ["student", "instructor"]) assert.ok(fs.existsSync("california/" + id + "/secure-final-exam/form-" + form + "-" + version + "-version.md"));
});

test("Anatoliy Kanevsky is not represented as DRE-approved", () => {
  const approvals = read("config/state-approval-records.json").states.CA;
  assert.equal(approvals.instructor.status, "qualification_package_prepared_not_approved");
  assert.equal(approvals.instructor.teaching_enabled, false);
  assert.equal(approvals.instructor.dre_license, "01385024");
});
