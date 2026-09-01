import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PROVIDER_FACTS, VERIFICATION_PROCEDURES, verificationFor } from "../config/approval-verification.mjs";
import { deriveJurisdictionRecord } from "../config/jurisdiction-record.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public/statecourse");
const page = fs.readFileSync(path.join(publicRoot, "approvals/index.html"), "utf8");
const catalog = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/course-catalog.json"), "utf8"));
const catalogCourses = catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => program.courses ?? []);
const registry = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/state-registry.json"), "utf8"));

test("the page states the absence of approval as plainly as it would state its presence", () => {
  assert.match(page, /No approval record/);
  assert.match(page, /No course application has been filed/);
  assert.match(page, /Not yet issued/);
  /* The failure this guards against is a page that reads as reassurance. Every
     jurisdiction with a course record must carry its own absence statement, not one
     global disclaimer. */
  const withCourses = new Set(catalogCourses.map((course) => course.state_id));
  for (const stateCode of withCourses) {
    const state = registry.states.find((entry) => entry.state_code === stateCode);
    if (!state) continue;
    const record = deriveJurisdictionRecord(catalogCourses.filter((course) => course.state_id === stateCode));
    if (record.approvalState === "approved") continue;
    assert.match(page, new RegExp(`${state.state_name} has not issued StateCourse a course approval number`),
      `${state.state_name} has course records but no absence statement`);
  }
});

test("no approval number appears that the catalog does not carry", () => {
  const numbers = new Set(catalogCourses.map((course) => course.approval_number).filter(Boolean));
  for (const match of page.matchAll(/Course approval number ([^<]+)</g)) {
    assert.ok(numbers.has(match[1].trim()), `the page advertises approval number ${match[1]}, which no catalog course carries`);
  }
  assert.equal(numbers.size, 0, "a course now carries an approval number — update this test to assert the approved state deliberately");
});

test("a verification procedure exists only where it was read from the regulator", () => {
  for (const [stateCode, procedure] of Object.entries(VERIFICATION_PROCEDURES)) {
    assert.match(procedure.lookupUrl, /^https:\/\//, `${stateCode} lookup is not an https URL`);
    assert.match(procedure.reviewedOn, /^\d{4}-\d{2}-\d{2}$/, `${stateCode} carries no review date`);
    assert.ok(procedure.steps.length >= 3, `${stateCode} has too few steps to be usable`);
  }
  /* A jurisdiction without a recorded procedure must fall back to the regulator, never
     to an invented set of steps. */
  assert.equal(verificationFor("TX"), null);
  assert.match(page, /A step-by-step verification procedure is published here once/);
});

test("California's procedure points at the Department's own course search", () => {
  const california = verificationFor("CA");
  assert.equal(california.lookupUrl, "https://secure.dre.ca.gov/publicasp/cestatutory.asp");
  assert.match(page, /secure\.dre\.ca\.gov\/publicasp\/cestatutory\.asp/);
  /* The mortgage elective is the corridor StateCourse occupies, so the reader is told
     to check it by name rather than assuming a provider approved for one course is
     approved for the others. */
  assert.match(california.steps.join(" "), /Mortgage Loan Brokering and Lending/);
});

test("the page separates provider approval from course approval", () => {
  assert.match(page, /Provider or sponsor approval/);
  assert.match(page, /Course approval/);
  assert.match(page, /3004\(b\)/);
  assert.match(page, /may not be promoted as/i);
});

test("approval verification is reachable from the pages that make approval claims", () => {
  const homepage = fs.readFileSync(path.join(publicRoot, "index.html"), "utf8");
  assert.match(homepage, /href="approvals\/"/, "the homepage does not link to approval verification");
  const california = fs.readFileSync(path.join(publicRoot, "real-estate/california/index.html"), "utf8");
  assert.match(california, /approvals\//, "a state page does not link to approval verification");
});

test("the provider record matches the entity the DRE forms are generated from", () => {
  const formData = JSON.parse(fs.readFileSync(path.join(root, "california/dre-sources/re336-data.json"), "utf8"));
  assert.equal(PROVIDER_FACTS.legalName, formData.provider.legalName);
  assert.equal(PROVIDER_FACTS.formationState, formData.provider.formationState);
  /* The Wyoming entity is retained for a different purpose and is not the applicant; it
     must never appear on a public approval page. */
  assert.doesNotMatch(page, /Wyoming|WY\b/);
  assert.equal(PROVIDER_FACTS.sponsorNumber, formData.provider.sponsorId || null);
});
