import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  MICHIGAN_MODULE_IDS,
  getMichiganAssessment,
  getMichiganCourse,
  michiganCreditedClockHours,
  publicMichiganAssessment,
  scoreMichiganAssessment
} from "../config/michigan-course-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const curriculumDir = path.join(root, "michigan/mi-salesperson-prelicensure-40-v1/curriculum");
const courseConfig = JSON.parse(read("config/courses/michigan-salesperson-v1.json"));
const registry = JSON.parse(read("public/statecourse/data/state-registry.json"));
const michigan = registry.states.find((state) => state.state_code === "MI");

test("the course is forty clock hours in ten modules", () => {
  const course = getMichiganCourse();
  assert.equal(course.requiredClockHours, 40, "MCL 339.2504 requires at least 40 clock hours");
  assert.equal(course.moduleCount, 10);
  assert.equal(course.clockHoursPerModule, 4);
  assert.equal(courseConfig.required_hours, 40);
  assert.equal(michigan.prelicense_hours, 40);
});

test("the statutory civil rights hours are one auditable block", () => {
  /* MCL 339.2504 requires at least 4 of the 40 clock hours on civil rights law and
     equal opportunity in housing. Distributing them across modules would make the
     minimum an argument rather than a fact; isolating them makes it one module to read. */
  const course = getMichiganCourse();
  assert.equal(course.civilRightsModule, "module-07");
  assert.equal(course.civilRightsClockHours, 4);
  const civilRights = course.modules.filter((module) => module.statutoryCivilRights);
  assert.equal(civilRights.length, 1, "exactly one module may carry the statutory hours");
  assert.equal(civilRights[0].clockHours, 4);

  const module07 = read("michigan/mi-salesperson-prelicensure-40-v1/curriculum/module-07.md");
  assert.match(module07, /MCL 339\.2504/);
  assert.match(module07, /No other module's time is counted toward this requirement/);
});

test("every module carries the six things R 339.22157(2) requires of a distance course", () => {
  const course = getMichiganCourse();
  for (const module of course.modules) {
    const text = read(module.curriculumPath);
    /* (c) at least one learning objective per module */
    assert.match(text, /## Learning objectives/, `${module.id} states no learning objectives`);
    /* (d) a structured learning method: six sections, each ending in a checkpoint */
    const sections = [...text.matchAll(/^## \d\. /gm)];
    assert.equal(sections.length, 6, `${module.id} has ${sections.length} instructional sections, expected 6`);
    const checkpoints = [...text.matchAll(/^#### Checkpoint /gm)];
    assert.equal(checkpoints.length, 6, `${module.id} has ${checkpoints.length} checkpoints, expected 6`);
    /* (e) assessment during the module, and (f) remediation repeating it */
    assert.match(text, /## Required applied exercise/, `${module.id} has no in-module applied exercise`);
    assert.match(text, /R 339\.22157\(2\)\(f\)/, `${module.id} does not tie its remediation to the rule`);
    /* (b) the module is addressable on its own */
    assert.ok(getMichiganAssessment(module.id, "engagement"), `${module.id} has no engagement assessment`);
    assert.ok(getMichiganAssessment(module.id, "remediation"), `${module.id} has no remediation set`);
    assert.ok(getMichiganAssessment(module.id, "applied"), `${module.id} has no applied item`);
  }
});

test("remediation items are different from the engagement items they follow", () => {
  /* R 339.22157(2)(f) requires the module to repeat until the student understands it.
     Serving the same five questions back would test recall of the answer, not the
     content. */
  for (const moduleId of MICHIGAN_MODULE_IDS) {
    const engagement = getMichiganAssessment(moduleId, "engagement");
    const remediation = getMichiganAssessment(moduleId, "remediation");
    const engagementPrompts = new Set(engagement.items.map((item) => item.prompt));
    for (const item of remediation.items) {
      assert.ok(!engagementPrompts.has(item.prompt), `${moduleId} reuses an engagement prompt in remediation`);
    }
  }
});

test("no prompt is reused anywhere in the course", () => {
  const seen = new Map();
  for (const moduleId of MICHIGAN_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      for (const item of getMichiganAssessment(moduleId, kind).items) {
        const existing = seen.get(item.prompt);
        assert.ok(!existing, `${moduleId}/${kind} repeats a prompt first used in ${existing}`);
        seen.set(item.prompt, `${moduleId}/${kind}`);
      }
    }
  }
  assert.equal(seen.size, 110, `expected 110 distinct items, found ${seen.size}`);
});

test("the delivered assessment carries no answer key", () => {
  for (const moduleId of MICHIGAN_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      const delivered = publicMichiganAssessment(getMichiganAssessment(moduleId, kind));
      for (const item of delivered.items) {
        assert.deepEqual(Object.keys(item).sort(), ["choices", "id", "prompt"],
          `${moduleId}/${kind} ships more than id, prompt and choices`);
      }
    }
  }
});

test("the presented choice order is not the authoring order", () => {
  /* Authoring puts the correct answer first for legibility. If the permutation ever
     stopped running, every correct answer would be choice A and the course would be
     worthless. */
  let atZero = 0;
  let total = 0;
  for (const moduleId of MICHIGAN_MODULE_IDS) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      for (const item of getMichiganAssessment(moduleId, kind).items) {
        total += 1;
        if (item.correctChoice === 0) atZero += 1;
      }
    }
  }
  assert.ok(atZero < total * 0.5, `${atZero} of ${total} correct answers are still in first position`);
});

test("the same item presents the same way every time", () => {
  /* A recorded selected_choice has to keep its meaning permanently, so the permutation
     must be a pure function of the item id. */
  const first = getMichiganAssessment("module-05", "engagement");
  const second = getMichiganAssessment("module-05", "engagement");
  assert.deepEqual(first.items.map((item) => item.choices), second.items.map((item) => item.choices));
  assert.deepEqual(first.items.map((item) => item.correctChoice), second.items.map((item) => item.correctChoice));
});

test("scoring reaches the mastery threshold at four of five and not at three", () => {
  const assessment = getMichiganAssessment("module-04", "engagement");
  const key = assessment.items.map((item) => item.correctChoice);
  assert.equal(scoreMichiganAssessment(assessment, key).percent, 100);
  const fourOfFive = key.map((choice, index) => (index === 0 ? (choice + 1) % 4 : choice));
  assert.equal(scoreMichiganAssessment(assessment, fourOfFive).percent, 80);
  assert.equal(scoreMichiganAssessment(assessment, fourOfFive).passed, true);
  const threeOfFive = key.map((choice, index) => (index < 2 ? (choice + 1) % 4 : choice));
  assert.equal(scoreMichiganAssessment(assessment, threeOfFive).passed, false);
  assert.equal(scoreMichiganAssessment(assessment, key.slice(1)), null, "a short answer array is a client bug");
});

test("credit is all or nothing per module, because Michigan attendance is total", () => {
  /* R 339.22152: a student must attend 100 percent of the course, and distance credit
     requires hours attended to equal hours approved. A time-weighted model would credit
     a partly finished module, which Michigan does not allow. */
  const nine = MICHIGAN_MODULE_IDS.slice(0, 9).map((id) => ({ module_id: id, status: "completed" }));
  const partial = michiganCreditedClockHours([...nine, { module_id: "module-10", status: "in_progress" }]);
  assert.equal(partial.creditedClockHours, 36);
  assert.equal(partial.courseComplete, false, "nine of ten modules is not a completed course");

  const all = MICHIGAN_MODULE_IDS.map((id) => ({ module_id: id, status: "completed" }));
  const full = michiganCreditedClockHours(all);
  assert.equal(full.creditedClockHours, 40);
  assert.equal(full.courseComplete, true);
  assert.equal(full.civilRightsSatisfied, true);

  const withoutCivilRights = michiganCreditedClockHours(
    all.filter((state) => state.module_id !== "module-07")
  );
  assert.equal(withoutCivilRights.civilRightsSatisfied, false);
  assert.equal(withoutCivilRights.civilRightsClockHours, 0);
  assert.equal(withoutCivilRights.courseComplete, false);
});

test("nothing claims Michigan approval, credit, or an examination Michigan does not require", () => {
  assert.equal(courseConfig.approval_number, null);
  assert.equal(courseConfig.enrollment_enabled, false);
  assert.equal(courseConfig.completion_rules.final_exam_required_by_state, false);
  assert.equal(courseConfig.completion_rules.proctoring_required_by_state, false);
  assert.match(courseConfig._completion_rules_notes.final_exam_required_by_state, /no Michigan document may describe it as a state requirement/);

  for (const moduleId of MICHIGAN_MODULE_IDS) {
    const text = read(`michigan/mi-salesperson-prelicensure-40-v1/curriculum/${moduleId}.md`);
    assert.match(text, /Not approved/, `${moduleId} does not carry the unapproved status`);
    assert.doesNotMatch(text, /Michigan requires a final examination/i);
  }
});

test("the course records what Michigan actually requires of records and reporting", () => {
  assert.equal(courseConfig.completion_rules.student_record_retention, "permanent");
  assert.equal(courseConfig.completion_rules.completion_reporting_business_days, 5);
  assert.equal(courseConfig.completion_rules.course_approval_term_days, 365);
  assert.match(michigan.record_retention_period, /[Pp]ermanent/);
  assert.match(michigan.reporting_requirements, /5 business days/);
  assert.match(michigan.certificate_rules, /approval number of the school/);
});

test("the source register uses the current rule numbering and says why", () => {
  const register = read("michigan/regulatory/official-sources.md");
  /* The rules were renumbered effective 4 June 2025 and LARA's own form still cites the
     old numbers. A citation to a rescinded rule is worse than no citation. */
  assert.match(register, /renumbered and largely rescinded effective June 4, 2025/);
  assert.match(register, /R 339\.22141/);
  assert.match(register, /R 339\.22157/);
  /* The register may name a rescinded number only while saying that it is rescinded, or
     while identifying the document that was read. What it may not do is cite one as the
     authority for a requirement, so each sentence containing such a number is checked
     for that context rather than the whole file being scanned at once. */
  const operative = new Set([
    "22101", "22121", "22125", "22131", "22134", "22135", "22137", "22139", "22141",
    "22143", "22145", "22147", "22149", "22152", "22154", "22155", "22157", "22158",
    "22159", "22161", "22163", "22165"
  ]);
  for (const sentence of register.split(/(?<=[.:])\s+/)) {
    for (const match of sentence.matchAll(/R 339\.(\d{5})/g)) {
      if (operative.has(match[1])) continue;
      assert.match(sentence, /rescind|Retrieved and read/i,
        `the register cites rescinded rule R 339.${match[1]} as authority: "${sentence.slice(0, 120)}"`);
    }
  }
  assert.match(register, /## Verification record/);
});

test("every module file names the rules it implements", () => {
  for (const moduleId of MICHIGAN_MODULE_IDS) {
    const text = read(`michigan/mi-salesperson-prelicensure-40-v1/curriculum/${moduleId}.md`);
    assert.match(text, /R 339\.22152/, `${moduleId} does not state Michigan's attendance rule`);
  }
});

test("the submission package answers every element of R 339.22157(2)", () => {
  const pkg = read("michigan/submission/course-approval-package.md");
  for (const element of ["(a)", "(b)", "(c)", "(d)", "(e)", "(f)"]) {
    assert.ok(pkg.includes(`### ${element}`), `the package does not answer R 339.22157(2)${element}`);
  }
  assert.match(pkg, /R 339\.22157\(5\)/, "the hardware and software failure remedy is not addressed");
  /* Every attachment R 339.22141(1) requires must appear in the attachment table with a
     status, including the one that does not apply — a silent omission and a stated
     "not applicable" look identical to a reviewer only until they ask. */
  for (const attachment of ["22141(1)(e)", "22141(1)(f)", "22141(1)(g)", "22141(1)(h)", "22141(1)(i)", "22141(1)(j)"]) {
    assert.ok(pkg.includes(attachment), `the attachment table omits R 339.${attachment}`);
  }
});

test("the package states what is a StateCourse standard rather than a Michigan rule", () => {
  const pkg = read("michigan/submission/course-approval-package.md");
  assert.match(pkg, /80 percent threshold is a StateCourse instructional standard, not a Michigan requirement/);
  assert.match(pkg, /Michigan prescribes none/);
  assert.match(pkg, /does not describe proctoring as a Michigan requirement/);
  /* And it must not claim an approval anywhere. */
  assert.match(pkg, /No StateCourse course is approved in any jurisdiction/);
  assert.doesNotMatch(pkg, /is approved by the Michigan Department/);
});

test("no certificate can be produced before an approval number exists", () => {
  const pkg = read("michigan/submission/course-approval-package.md");
  /* The school's approval number is one of the five fields R 339.22141(1)(f) requires on
     the certificate, so a certificate before approval is a certificate that lies. */
  assert.match(pkg, /No certificate can be issued before the Department assigns an approval number/);
  assert.match(pkg, /refuses to produce a certificate while the approval number is absent/);
});

test("the open items are recorded rather than assumed away", () => {
  const pkg = read("michigan/submission/course-approval-package.md");
  for (const item of [/Proprietary Schools Act/, /instructor route/i, /program coordinator/i, /ARELLO or equivalence/i, /one-year approval term/i]) {
    assert.match(pkg, item);
  }
});
