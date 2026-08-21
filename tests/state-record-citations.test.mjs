import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/*
 * A state's public record must cite its own regulator and no other.
 *
 * This guard exists because a real defect shipped: the Arizona registry entry
 * said "SPS 2025.01 controls" and the Arizona course record said the course was
 * "proposed under SPS 2025.01". SPS is Wisconsin's Department of Safety and
 * Professional Services. Nothing in Arizona law is numbered that way. The
 * string reached four generated pages — the national requirements table, the
 * course catalog, the Arizona jurisdiction hub, and the Arizona salesperson
 * course page — because the registry and catalog are the sole source those
 * pages render from and nothing checked them.
 *
 * The scope is deliberately narrow. Curriculum modules DO compare jurisdictions
 * on purpose: the Arizona duties module records that Arizona is a fiduciary
 * state where Washington's statute says its duties are "statutory duties and
 * not fiduciary duties" and Oklahoma abrogated them, and that contrast is the
 * point of the lesson. What must never happen is a state's REGULATORY RECORD —
 * the registry entry and the catalog entry a student reads as the statement of
 * that state's requirements — citing another state's statute, rule or agency.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public/statecourse");
const registry = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/state-registry.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/course-catalog.json"), "utf8"));
const catalogCourses = catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => program.courses ?? []);

/*
 * One entry per built jurisdiction, holding citation forms and agency names
 * distinctive enough that finding one inside a different state's record is a
 * defect and not a coincidence. Shared forms are excluded on purpose:
 * California and Colorado both publish in a "CCR", so the patterns carry the
 * title number that separates them, and bare "DRE" is not listed at all
 * because California and Colorado both use it.
 */
const JURISDICTION_CITATIONS = {
  AK: [/\bAS 08\.88/, /\b12 AAC 64\b/, /Alaska Real Estate Commission/i],
  AZ: [/A\.R\.S\./, /A\.A\.C\./, /\bR4-28-/, /Arizona Department of Real Estate/i, /\bADRE\b/],
  CA: [/Business and Professions Code/i, /\b10 CCR\b/, /California Department of Real Estate/i],
  CO: [/C\.R\.S\./, /\b4 CCR 725/, /\bREC-33\b/, /Colorado Division of Real Estate/i, /\bDPOS\b/],
  ME: [/M\.R\.S\./, /Maine Real Estate Commission/i],
  MI: [/\bMCL 339/, /\bLARA\b/, /Michigan Department of Licensing/i],
  MO: [/\bRSMo\b/, /\b20 CSR 2250/, /Missouri Real Estate Commission/i],
  NC: [/N\.C\.G\.S\./, /\b21 NCAC 58/, /North Carolina Real Estate Commission/i],
  OK: [/Okla\. Stat\./, /\bOAC 605\b/, /Oklahoma Real Estate Commission/i],
  PA: [/Pa\. Code\b/, /\b63 P\.S\./, /Pennsylvania Real Estate Commission/i],
  VA: [/\b54\.1-2\d/, /\b18 VAC 135/, /\bDPOR\b/],
  WA: [/\bRCW 18\.85/, /\bWAC 308-124/, /Washington State Department of Licensing/i],
  WI: [/Wis\. Stat\./, /\bREEB\b/, /\bSPS \d/, /Department of Safety and Professional Services/i],
};

/* Every string anywhere inside a record, however deeply nested. */
const collectStrings = (value, out = []) => {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, out);
  else if (value && typeof value === "object") for (const item of Object.values(value)) collectStrings(item, out);
  return out;
};

const foreignCitations = (stateCode, record) => {
  const found = [];
  for (const text of collectStrings(record)) {
    for (const [owner, patterns] of Object.entries(JURISDICTION_CITATIONS)) {
      if (owner === stateCode) continue;
      for (const pattern of patterns) {
        if (pattern.test(text)) found.push(`${owner} pattern ${pattern} in: ${text.slice(0, 200)}`);
      }
    }
  }
  return found;
};

test("no state registry entry cites another state's statute, rule or agency", () => {
  for (const state of registry.states) {
    const found = foreignCitations(state.state_code, state);
    assert.deepEqual(found, [], `${state.state_name} registry entry carries a foreign citation:\n${found.join("\n")}`);
  }
});

test("no catalog course record cites another state's statute, rule or agency", () => {
  for (const course of catalogCourses) {
    const found = foreignCitations(course.state_id, course);
    assert.deepEqual(found, [], `${course.course_title} carries a foreign citation:\n${found.join("\n")}`);
  }
});

test("every catalog course belongs to a state the registry lists, and the registry claims it back", () => {
  const byCode = new Map(registry.states.map((state) => [state.state_code, state]));
  for (const course of catalogCourses) {
    const state = byCode.get(course.state_id);
    assert.ok(state, `${course.course_id} names state ${course.state_id}, which the registry does not list`);
    assert.ok(
      (state.course_ids ?? []).includes(course.course_id),
      `${course.course_id} is in the catalog but ${state.state_name}'s registry entry does not list it`,
    );
  }
});

test("every course a registry entry claims exists in the catalog", () => {
  const catalogIds = new Set(catalogCourses.map((course) => course.course_id));
  for (const state of registry.states) {
    for (const courseId of state.course_ids ?? []) {
      assert.ok(catalogIds.has(courseId), `${state.state_name} claims course ${courseId}, which the catalog does not contain`);
    }
  }
});

/*
 * The Arizona entry that carried the defect, pinned by its corrected content.
 * The figures here are the ones a source states: 75 percent is A.A.C.
 * R4-28-401(A)(1), the in-person proctoring requirement is A.R.S. § 32-2124(B),
 * and the five-year record is R4-28-404(D). The two manufactured claims — an
 * item-bank ratio and a student-device restriction — must not return.
 */
test("the Arizona record states the rules a source states and none it invented", () => {
  const arizona = registry.states.find((state) => state.state_code === "AZ");
  assert.ok(arizona, "Arizona is missing from the registry");

  assert.match(arizona.final_exam_rules, /75 percent/, "the passing score R4-28-401(A)(1) states is missing");
  assert.match(arizona.final_exam_rules, /R4-28-401\(A\)\(1\)/, "the passing score is stated without its rule");
  assert.match(arizona.proctoring_rules, /32-2124\(B\)/, "the proctoring statute is missing");
  assert.match(arizona.proctoring_rules, /IN PERSON/, "the statute's in-person proctoring requirement is missing");
  assert.match(arizona.record_retention_period, /R4-28-404\(D\)/, "the five-year record rule is missing");

  /*
   * Patterns that can only be an assertion. "no item-bank ratio is stated and
   * none is claimed" is the corrected text and must survive, so the ratio
   * pattern matches the figure rather than the words around it.
   */
  const invented = [
    /\b\d+\s*:\s*\d+\b[^.]{0,40}\b(bank|ratio|item pool)\b/i,
    /\b(bank|item pool)\b[^.]{0,40}\b\d+\s*:\s*\d+\b/i,
    /student-supplied device/i,
    /\bSPS \d/,
  ];
  for (const state of registry.states) {
    for (const text of collectStrings(state)) {
      for (const pattern of invented) {
        assert.equal(pattern.test(text), false, `${state.state_name} carries a manufactured rule matching ${pattern}: ${text.slice(0, 200)}`);
      }
    }
  }
  for (const course of catalogCourses) {
    for (const text of collectStrings(course)) {
      for (const pattern of invented) {
        assert.equal(pattern.test(text), false, `${course.course_id} carries a manufactured rule matching ${pattern}: ${text.slice(0, 200)}`);
      }
    }
  }
});
