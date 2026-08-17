import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

const courses = [
  ["arizona/az-salesperson-prelicense-90-v1", "AZ", 90, 0],
  ["arizona/az-contract-writing-6-v1", "AZ", 6, 40],
  ["washington/wa-real-estate-fundamentals-60-v1", "WA", 60, 0],
  ["washington/wa-real-estate-practices-30-v1", "WA", 30, 0],
  ["pennsylvania/pa-real-estate-fundamentals-30-v1", "PA", 30, 0],
  ["pennsylvania/pa-real-estate-practice-45-v1", "PA", 45, 0],
  ["north-carolina/nc-broker-prelicensing-75-v1", "NC", 75, 100],
  ["colorado/co-real-estate-law-practice-48-v1", "CO", 48, 96],
  ["colorado/co-contracts-regulations-48-v1", "CO", 48, 96],
  ["colorado/co-trust-accounts-recordkeeping-8-v1", "CO", 8, 25],
  ["colorado/co-current-legal-issues-8-v1", "CO", 8, 25],
  ["colorado/co-real-estate-closings-24-v1", "CO", 24, 48],
  ["colorado/co-practical-applications-32-v1", "CO", 32, 64],
];

test("all thirteen new courses have exact hours and remain approval gated", async () => {
  for (const [base, state, hours] of courses) {
    const config = JSON.parse(await read(`${base}/lms-config.json`));
    assert.equal(config.state, state);
    assert.equal(config.required_hours, hours);
    assert.equal(config.modules.reduce((sum, module) => sum + module.hours, 0), hours);
    assert.equal(config.lifecycle.status, "development");
    assert.equal(config.lifecycle.enrollment_enabled, false);
    assert.equal(config.lifecycle.regulatory_credit_enabled, false);
    assert.equal(config.stripe.enabled, false);
    assert.equal(config.instructor.assigned_instructor_id, null);
  }
});

test("generated unit curricula and secure banks match each course configuration", async () => {
  for (const [base, , hours, bankItems] of courses) {
    const curriculum = await read(`${base}/curriculum/hour-by-hour-curriculum.md`);
    const bank = await read(`${base}/assessments/final-exam-bank.md`);
    assert.equal([...curriculum.matchAll(/^## Unit \d{3}/gm)].length, hours);
    assert.equal([...bank.matchAll(/^## Bank Item \d{3}/gm)].length, bankItems);
    assert.match(bank, /CONFIDENTIAL/);
    if (bankItems === 0) assert.match(bank, /no production-ready bank exists yet/i);
  }
});

test("Washington, Pennsylvania, Arizona, and Colorado retain separate regulatory records", async () => {
  const catalog = JSON.parse(await read("public/statecourse/data/course-catalog.json"));
  const all = catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => program.courses ?? []);
  assert.equal(all.filter((course) => course.state_id === "AZ").length, 2);
  assert.equal(all.filter((course) => course.state_id === "WA").length, 2);
  assert.equal(all.filter((course) => course.state_id === "PA").length, 2);
  assert.equal(all.filter((course) => course.state_id === "NC").length, 1);
  assert.equal(all.filter((course) => course.state_id === "CO").length, 6);
  assert.equal(all.filter((course) => course.state_id === "CO").reduce((sum, course) => sum + course.required_hours, 0), 168);
  assert.equal(new Set(all.map((course) => course.course_id)).size, all.length);
});

test("state approval records separate school/provider, instructor, course, and delivery gates", async () => {
  const approvals = JSON.parse(await read("config/state-approval-records.json"));
  assert.deepEqual(Object.keys(approvals.states).sort(), ["AZ", "CA", "CO", "NC", "PA", "WA"]);
  for (const state of Object.values(approvals.states)) {
    assert.equal(state.public_status, "In Development");
    assert.equal(state.enrollment_enabled, false);
    assert.ok(Object.keys(state.approval_records).length >= 4);
    for (const record of Object.values(state.approval_records)) {
      assert.equal(record.status, "development");
      assert.equal(record.approval_number, null);
    }
  }
});

test("state-specific regulatory controls are not promoted to national defaults", async () => {
  const controls = JSON.parse(await read("config/state-regulatory-controls.json"));
  assert.equal(controls.states["nc-broker-prelicensing-75-v1"].delivery.enrollment_validity_days, 180);
  assert.equal(controls.states["az-salesperson-prelicense-90-v1"].identity.username_password_alone_sufficient, false);
  assert.equal(controls.states["pa-real-estate-fundamentals-30-v1"].assessment.passing_percent, null);
  assert.equal(controls.states["pa-real-estate-fundamentals-30-v1"].assessment.questions_per_form, null);
  assert.equal(controls.states["pa-real-estate-fundamentals-30-v1"].records.retention_years, 10);
  assert.equal(controls.states["pa-real-estate-practice-45-v1"].assessment.questions_per_form, null);
  assert.equal(controls.states["pa-real-estate-practice-45-v1"].records.retention_years, 10);
  assert.equal(controls.states["co-current-legal-issues-8-v1"].assessment.passing_percent, null);
  assert.equal(controls.states["wa-real-estate-fundamentals-60-v1"].assessment.questions_per_form, 180);
  assert.equal(controls.states["wa-real-estate-practices-30-v1"].assessment.questions_per_form, 90);
  const arizona = controls.states["az-salesperson-prelicense-90-v1"];
  assert.equal(arizona.modules.reduce((sum, module) => sum + (module.arizona_specific_hours ?? 0), 0), 27);
});
