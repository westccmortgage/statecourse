import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { deriveJurisdictionRecord, JURISDICTION_APPROVAL_LABELS } from "../config/jurisdiction-record.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public/statecourse");
const catalog = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/course-catalog.json"), "utf8"));
const catalogCourses = catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => program.courses ?? []);
const registry = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/state-registry.json"), "utf8"));

const slugify = (name) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
const recordValue = (html, label) => {
  const match = html.match(new RegExp(`<dt>${label}</dt><dd>(.*?)</dd>`, "s"));
  return match ? match[1] : null;
};

test("a jurisdiction with no course record advertises no approval and no enrollment", () => {
  const derived = deriveJurisdictionRecord([]);
  assert.equal(derived.approvalState, "no-course-record");
  assert.equal(JURISDICTION_APPROVAL_LABELS[derived.approvalState], "No course record");
  assert.equal(derived.enrollmentOpen, false);
  assert.equal(derived.enrollmentLine, "Closed until approval");
});

test("an unapproved course never yields an approval number or an open enrollment", () => {
  for (const approvalNumber of [null, undefined, "", "   "]) {
    const derived = deriveJurisdictionRecord([
      { course_title: "Course", approval_number: approvalNumber, enrollment_enabled: true },
    ]);
    assert.deepEqual(derived.approvedCourses, [], `approval_number ${JSON.stringify(approvalNumber)} produced an approval`);
    assert.equal(derived.approvalState, "not-yet-approved");
    assert.equal(JURISDICTION_APPROVAL_LABELS[derived.approvalState], "Not yet approved");
    /* The safety coupling: enrollment_enabled alone must not open enrollment. */
    assert.equal(derived.enrollmentOpen, false);
    assert.equal(derived.enrollmentLine, "Closed until approval");
  }
});

test("an approved course whose enrollment flag is off stays closed but shows its approval number", () => {
  const derived = deriveJurisdictionRecord([
    { course_title: "Real Estate Principles", approval_number: "S0000", enrollment_enabled: false },
  ]);
  assert.equal(derived.approvalState, "approved");
  assert.deepEqual(derived.approvedCourses, [
    { courseTitle: "Real Estate Principles", approvalNumber: "S0000", enrollmentEnabled: false },
  ]);
  assert.equal(derived.enrollmentOpen, false);
  assert.equal(derived.enrollmentLine, "Closed until approval");
});

test("enrollment opens only where an approval number and an enabled flag meet on one course", () => {
  const derived = deriveJurisdictionRecord([
    { course_title: "Approved, not selling", approval_number: "S0001", enrollment_enabled: false },
    { course_title: "Selling, not approved", approval_number: null, enrollment_enabled: true },
  ]);
  assert.equal(derived.enrollmentOpen, false, "an approval on one course must not open enrollment on another");

  const opened = deriveJurisdictionRecord([
    { course_title: "Approved and selling", approval_number: "S0002", enrollment_enabled: true },
  ]);
  assert.equal(opened.enrollmentOpen, true);
  assert.equal(opened.enrollmentLine, "Open for approved courses");
});

test("only a literal true opens enrollment", () => {
  for (const flag of ["true", 1, "yes", null, undefined]) {
    const derived = deriveJurisdictionRecord([
      { course_title: "Course", approval_number: "S0003", enrollment_enabled: flag },
    ]);
    assert.equal(derived.enrollmentOpen, false, `enrollment_enabled ${JSON.stringify(flag)} opened enrollment`);
  }
});

test("every generated state page matches the catalog it was generated from", () => {
  const stateNames = new Set([...registry.states.map((state) => state.state_name), "District of Columbia"]);
  let checked = 0;
  for (const stateName of stateNames) {
    const file = path.join(publicRoot, `real-estate/${slugify(stateName)}/index.html`);
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    const stateCode = [...registry.states].find((state) => state.state_name === stateName)?.state_code ?? "DC";
    const derived = deriveJurisdictionRecord(catalogCourses.filter((course) => course.state_id === stateCode));
    const expectedApproval = derived.approvalState === "approved"
      ? derived.approvedCourses.map((entry) => `${entry.courseTitle}: ${entry.approvalNumber}`).join("<br/>")
      : JURISDICTION_APPROVAL_LABELS[derived.approvalState];
    assert.equal(recordValue(html, "Course approval"), expectedApproval, `${stateName} course approval line`);
    assert.equal(recordValue(html, "Enrollment"), derived.enrollmentLine, `${stateName} enrollment line`);
    checked += 1;
  }
  assert.ok(checked >= 50, `expected to check every jurisdiction page, checked ${checked}`);
});

test("no state page prints an approval number the catalog does not carry", () => {
  /* Today no course in the catalog is approved, so no page may print an approval number
     at all. This assertion is not a restatement of the derivation: it reads the shipped
     HTML, so it also catches an approval number hardcoded into any page by hand. */
  const catalogNumbers = new Set(catalogCourses.map((course) => course.approval_number).filter(Boolean));
  const stateDirs = fs.readdirSync(path.join(publicRoot, "real-estate"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
  for (const dir of stateDirs) {
    const file = path.join(publicRoot, "real-estate", dir.name, "index.html");
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    const approval = recordValue(html, "Course approval");
    if (approval === "No course record" || approval === "Not yet approved") continue;
    for (const line of approval.split("<br/>")) {
      const number = line.split(": ").pop();
      assert.ok(catalogNumbers.has(number), `${dir.name} advertises approval number ${number}, which no catalog course carries`);
    }
  }
});

test("no jurisdiction claims an open enrollment while nothing is approved", () => {
  assert.equal(catalogCourses.filter((course) => course.approval_number).length, 0,
    "a course now carries an approval number — update this test to assert the approved state deliberately");
  const stateDirs = fs.readdirSync(path.join(publicRoot, "real-estate"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
  for (const dir of stateDirs) {
    const file = path.join(publicRoot, "real-estate", dir.name, "index.html");
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    assert.equal(recordValue(html, "Enrollment"), "Closed until approval", `${dir.name} enrollment line`);
  }
});
