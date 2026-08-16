import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = [
  ["../wisconsin/lms-config.json", 72, 1, 100],
  ["../missouri/mo-salesperson-preexam-48-v1/lms-config.json", 48, 2, 50],
  ["../missouri/mo-real-estate-practice-24-v1/lms-config.json", 24, 2, 50],
  ["../oklahoma/lms-config.json", 90, 2, 150],
];

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("course configurations total their exact state-required hours", async () => {
  for (const [path, hours, forms, questions] of files) {
    const config = JSON.parse(await read(path));
    assert.equal(config.required_hours, hours);
    assert.equal(config.modules.reduce((sum, module) => sum + module.hours, 0), hours);
    assert.equal(config.assessment.final_forms, forms);
    assert.equal(config.assessment.questions_per_form, questions);
    assert.equal(config.lifecycle.status, "development");
    assert.equal(config.lifecycle.enrollment_enabled, false);
    assert.equal(config.lifecycle.credit_enabled, false);
    assert.equal(config.stripe.enabled, false);
  }
});

test("Missouri courses remain separate approval, exam, and reporting records", async () => {
  const preExam = JSON.parse(await read("../missouri/mo-salesperson-preexam-48-v1/lms-config.json"));
  const practice = JSON.parse(await read("../missouri/mo-real-estate-practice-24-v1/lms-config.json"));
  assert.notEqual(preExam.course_id, practice.course_id);
  assert.notEqual(preExam.certificate.template, practice.certificate.template);
  assert.equal(preExam.reporting.completion_roster_days, 10);
  assert.equal(practice.reporting.completion_roster_days, 10);
  assert.deepEqual(preExam.reporting.completion_time_statistics.due_month_days, ["01-31", "07-31"]);
  assert.deepEqual(practice.reporting.completion_time_statistics.due_month_days, ["01-31", "07-31"]);
  assert.equal(preExam.reporting.completion_time_statistics.less_than_submitted_threshold_percent, 50);
});

test("secure exam banks contain the configured number of form items", async () => {
  const banks = [
    ["../wisconsin/assessments/final-exam-bank.md", { A: 100 }],
    ["../missouri/mo-salesperson-preexam-48-v1/assessments/final-exam-bank.md", { A: 50, B: 50 }],
    ["../missouri/mo-real-estate-practice-24-v1/assessments/final-exam-bank.md", { A: 50, B: 50 }],
    ["../oklahoma/assessments/final-exam-bank.md", { A: 150, B: 150 }],
  ];
  for (const [path, expected] of banks) {
    const bank = await read(path);
    for (const [form, count] of Object.entries(expected)) {
      assert.equal([...bank.matchAll(new RegExp(`^## Form ${form} · Item`, "gm"))].length, count);
    }
    assert.match(bank, /SME|subject-matter|psychometric/i);
  }
});

test("national core is reusable but never represented as state approval", async () => {
  const core = JSON.parse(await read("../national-core/core-modules.json"));
  assert.equal(core.modules.length, 9);
  const readme = await read("../national-core/README.md");
  assert.match(readme, /does not constitute|not.*approval|never regulatory approval/i);
});
