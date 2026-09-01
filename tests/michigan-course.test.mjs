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
const catalog = JSON.parse(read("public/statecourse/data/course-catalog.json"));
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
  assert.equal(courseConfig.completion_rules.final_exam_offered_by_provider, false);
  assert.equal(courseConfig.completion_rules.proctoring_required_by_state, false);
  assert.match(courseConfig._completion_rules_notes.final_exam_required_by_state, /no Michigan document may describe a final examination as a state requirement/i);

  for (const moduleId of MICHIGAN_MODULE_IDS) {
    const text = read(`michigan/mi-salesperson-prelicensure-40-v1/curriculum/${moduleId}.md`);
    assert.match(text, /Not approved/, `${moduleId} does not carry the unapproved status`);
    assert.doesNotMatch(text, /Michigan requires a final examination/i);
  }
});

test("the course records what Michigan actually requires of records and reporting", () => {
  assert.equal(courseConfig.completion_rules.student_record_retention, "permanent");
  assert.equal(courseConfig.completion_rules.completion_reporting_business_days, 5);
  assert.equal(courseConfig.completion_rules.identity_verification_before_completion_report, true);
  assert.equal(courseConfig.completion_rules.course_approval_term, "one_calendar_year_from_approval");
  assert.equal(courseConfig.completion_rules.renewal_filing_days_before_expiration, 60);
  assert.equal("course_approval_term_days" in courseConfig.completion_rules, false, "a 365-day surrogate drifts across leap years");
  assert.match(michigan.record_retention_period, /[Pp]ermanent/);
  assert.match(michigan.reporting_requirements, /5 business days/);
  assert.match(michigan.certificate_rules, /approval number of the school/);
});

test("identity independently blocks both the certificate and every completion report", () => {
  assert.equal(courseConfig.completion_rules.identity_verification_before_certificate, true);
  assert.equal(courseConfig.completion_rules.identity_verification_before_completion_report, true);
  for (const relative of [
    "michigan/submission/00-filing-index.md",
    "michigan/submission/course-approval-package.md",
    "michigan/submission/pss/equipment-platform-list.md",
    "michigan/submission/bpl/syllabus.md",
    "michigan/submission/bpl/enrollment-application.md",
    "michigan/submission/bpl/reviewer-access-and-materials-manifest.md",
  ]) {
    const text = read(relative);
    assert.match(text, /completion report|report\/export|reported student|reported or exported/i, `${relative} omits the reporting identity gate`);
  }
});

test("the source register uses the current rule numbering and says why", () => {
  const register = read("michigan/regulatory/official-sources.md");
  /* The rules were renumbered effective 4 June 2025 and LARA's own form still cites the
     old numbers. A citation to a rescinded rule is worse than no citation. */
  assert.match(register, /renumbered and largely rescinded effective June 4, 2025/);
  assert.match(register, /R 339\.22141/);
  assert.match(register, /R 339\.22157/);
  assert.match(register, /R 339\.22159/);
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
  assert.match(pkg, /thresholds are StateCourse instructional standards, not Michigan requirements/);
  assert.match(pkg, /Michigan prescribes none/);
  assert.match(pkg, /does not describe proctoring as a Michigan requirement/);
  /* And it must not claim Michigan approval. */
  assert.match(pkg, /No StateCourse Michigan course or proprietary-school application has been approved or filed/);
  assert.doesNotMatch(pkg, /is approved by the Michigan Department/);
});

test("no certificate can be produced before an approval number exists", () => {
  const pkg = read("michigan/submission/course-approval-package.md");
  /* The school's approval number is one of the five fields R 339.22141(1)(f) requires on
     the certificate, so a certificate before approval is a certificate that lies. */
  assert.match(pkg, /No certificate can be issued before the Department assigns the required approval identifier/);
  assert.match(pkg, /refuse issuance while any identifier BPL confirms is required remains absent/);
});

test("the two-regulator filing dependencies are recorded rather than assumed away", () => {
  const pkg = read("michigan/submission/course-approval-package.md");
  for (const item of [/PSS proprietary-school licence/i, /instructor approval/i, /program coordinator/i, /ARELLO or equivalence/i, /one-year approval term/i]) {
    assert.match(pkg, item);
  }
  assert.doesNotMatch(pkg, /Whether StateCourse is a proprietary school.*open question/is);
});

test("PSS applicability is resolved from official Michigan sources", () => {
  const [register, baseline, screening] = [
    read("michigan/regulatory/official-sources.md"),
    read("michigan/regulatory/compliance-baseline.md"),
    read("docs/states/online-delivery-screening.md"),
  ];
  for (const text of [register, baseline, screening]) {
    assert.match(text, /non-degree/i);
    assert.match(text, /no Michigan physical presence|no physical presence in Michigan/i);
    assert.match(text, /must (also )?(hold|be licensed)|licen[cs]e.*required|required.*licen[cs]e/i);
    assert.doesNotMatch(text, /Whether StateCourse is a proprietary school.*(open|legal question)/is);
  }
  assert.match(register, /Specialized Licensing Requirements/);
  assert.match(register, /MiPSS Proprietary Schools License User Guide/);
  assert.match(register, /R 390\.564/);
  assert.match(michigan.ARELLO_status, /R 339\.22157/);
  assert.doesNotMatch(michigan.ARELLO_status, /Rule 626/);
});

test("the Michigan filing packet contains distinct PSS, BPL, and instructor artifacts", () => {
  const required = [
    "michigan/submission/00-filing-index.md",
    "michigan/submission/01-mipss-school-program-datasheet.md",
    "michigan/submission/02-pss-upload-manifest.md",
    "michigan/submission/pss/position-descriptions.md",
    "michigan/submission/pss/personnel-entries-and-evidence-checklist.md",
    "michigan/submission/pss/equipment-platform-list.md",
    "michigan/submission/pss/surety-bond-checklist.md",
    "michigan/submission/pss/student-contract-and-catalog-controls.md",
    "michigan/submission/pss/student-complaint-policy.md",
    "michigan/submission/pss/student-catalog-draft.md",
    "michigan/submission/pss/enrollment-agreement-draft.md",
    "michigan/submission/pss/records-retention-and-closure-plan.md",
    "michigan/submission/pss/recruitment-location-and-surety-controls.md",
    "michigan/submission/pss/student-support-capacity-plan.md",
    "michigan/submission/bpl/syllabus.md",
    "michigan/submission/bpl/certificate-specimen.md",
    "michigan/submission/bpl/asynchronous-attestation.md",
    "michigan/submission/bpl/enrollment-application.md",
    "michigan/submission/bpl/hardware-software-plan.md",
    "michigan/submission/bpl/non-arello-equivalence.md",
    "michigan/submission/bpl/assessment-manifest.md",
    "michigan/submission/bpl/applied-memo-rubric.md",
    "michigan/submission/bpl/reviewer-access-and-materials-manifest.md",
    "michigan/submission/instructor/qualification-dossier.md",
    "michigan/submission/instructor/responsibilities-statement.md",
    "michigan/submission/regulator-inquiries/PSS-prefiling-inquiry.md",
    "michigan/submission/regulator-inquiries/BPL-prefiling-inquiry.md",
    "michigan/submission/generated/Prelicensure-Course-Approval-Application-DRAFT-UNSIGNED.pdf",
  ];
  for (const relative of required) {
    const full = path.join(root, relative);
    assert.ok(fs.existsSync(full), `${relative} is missing`);
    assert.ok(fs.statSync(full).size > 0, `${relative} is empty`);
  }
});

test("the canonical Michigan course title and proposed instructor do not drift", () => {
  const title = "Principles of Real Estate - Michigan Salesperson Prelicensure";
  const publicCourse = catalog.categories
    .flatMap((category) => category.programs ?? [])
    .flatMap((program) => program.courses ?? [])
    .find((course) => course.course_id === "mi-salesperson-prelicensure-40-v1");
  assert.equal(courseConfig.title, title);
  assert.equal(publicCourse.course_title, title);
  assert.equal(publicCourse.instructor_id, "anatoliy-kanevsky-candidate");
  for (const relative of [
    "michigan/submission/course-approval-package.md",
    "michigan/submission/bpl/syllabus.md",
    "michigan/submission/bpl/enrollment-application.md",
    "michigan/submission/instructor/qualification-dossier.md",
  ]) {
    assert.match(read(relative), new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("the Michigan course version is one controlled value across filing surfaces", () => {
  const expected = "1.0-submission-draft";
  const course = getMichiganCourse();
  const publicCourse = catalog.categories
    .flatMap((category) => category.programs ?? [])
    .flatMap((program) => program.courses ?? [])
    .find((entry) => entry.course_id === "mi-salesperson-prelicensure-40-v1");
  assert.equal(courseConfig.course_version, expected);
  assert.equal(course.version, expected);
  assert.equal(publicCourse.course_version, expected);
  assert.match(read("michigan/submission/bpl/assessment-manifest.md"), new RegExp(expected));
  assert.match(read("michigan/submission/pss/student-catalog-draft.md"), new RegExp(expected));
  assert.match(read("michigan/submission/pss/enrollment-agreement-draft.md"), new RegExp(expected));
  for (const moduleId of MICHIGAN_MODULE_IDS) {
    const text = read(`michigan/mi-salesperson-prelicensure-40-v1/curriculum/${moduleId}.md`);
    assert.match(text, /\*\*Course version:\*\* 1\.0-submission-draft/);
    assert.match(text, /^# Principles of Real Estate - Michigan Salesperson Prelicensure — Module \d{2}$/m);
  }
});

test("R 339.22159 keeps every noneducational solicitation outside credited hours", () => {
  assert.equal(courseConfig.completion_rules.noneducational_solicitation_during_credited_hours_prohibited, true);
  const register = read("michigan/regulatory/official-sources.md");
  const baseline = read("michigan/regulatory/compliance-baseline.md");
  const pkg = read("michigan/submission/course-approval-package.md");
  for (const text of [register, baseline, pkg]) {
    assert.match(text, /R 339\.22159/);
    assert.match(text, /noneducational|non-educational/i);
  }
  const creditedContent = MICHIGAN_MODULE_IDS
    .map((moduleId) => read(`michigan/mi-salesperson-prelicensure-40-v1/curriculum/${moduleId}.md`))
    .join("\n");
  assert.doesNotMatch(
    creditedContent,
    /Complete Licensing Path|Create (?:a )?Free Account|Upgrade (?:Your )?Account|Enroll Now|membership offer|employment opportunity|recruiting opportunity/i,
    "a marketing, account, employment, membership, or recruiting solicitation entered credited course content"
  );
});

test("the Michigan advertising script contains no imported California filing rule", () => {
  const intro = read("marketing/state-intros/MI-michigan.md");
  assert.doesNotMatch(intro, /RE 303|Regulation 3004|DRE-approved/i);
  assert.match(intro, /Michigan PSS\/BPL/);
  assert.match(intro, /noneducational solicitation earns no credit/i);
});

test("the assessment manifest reconciles to the secure 110-item bank without exposing keys", () => {
  const manifest = read("michigan/submission/bpl/assessment-manifest.md");
  assert.match(manifest, /\*\*110\*\*/);
  assert.match(manifest, /\*\*10\*\*.*\*\*50\*\*.*\*\*50\*\*/s);
  assert.match(manifest, /contains neither prompts nor answer keys/i);
  assert.doesNotMatch(manifest, /correctChoice|rationale:/);
});

test("written memos and machine-scored confirmations are distinct and jointly gate every module", () => {
  assert.equal(courseConfig.completion_rules.applied_memo_submission_required, true);
  assert.equal(courseConfig.completion_rules.applied_memo_instructor_review_required, true);
  assert.equal(courseConfig.completion_rules.applied_memo_passing_points, 8);
  assert.equal(courseConfig.completion_rules.applied_memo_total_points, 10);
  assert.equal(courseConfig.completion_rules.applied_confirmation_item_required, true);
  assert.equal(courseConfig.completion_rules.applied_confirmation_item_passing_percent, 100);
  const rubric = read("michigan/submission/bpl/applied-memo-rubric.md");
  assert.match(rubric, /BPL-approved instructor only/i);
  assert.match(rubric, /8 of 10 points/i);
  assert.match(rubric, /needs-revision result keeps the module incomplete/i);
  const manifest = read("michigan/submission/bpl/assessment-manifest.md");
  assert.match(manifest, /Written performance assessment.*separate from the 110-item bank/is);
  assert.match(manifest, /10 written submissions/i);
  for (const moduleId of MICHIGAN_MODULE_IDS) {
    const text = read(`michigan/mi-salesperson-prelicensure-40-v1/curriculum/${moduleId}.md`);
    assert.match(text, /common 10-point applied-memo rubric/i, `${moduleId} omits the memo rubric`);
    assert.match(text, /one-item applied confirmation check at 100 percent/i, `${moduleId} omits the confirmation item`);
    assert.match(text, /\| Applied exercise: .* \+ confirmation \| 20 \| Written response and applied-confirmation result recorded \|/, `${moduleId} assigns no clock time/evidence to confirmation`);
  }
  const equipment = read("michigan/submission/pss/equipment-platform-list.md");
  assert.match(equipment, /Written-memo review service/);
  assert.match(equipment, /To implement and acceptance-test before PSS filing/);
  const capacity = read("michigan/submission/pss/student-support-capacity-plan.md");
  assert.match(capacity, /pending memorandum review/i);
  assert.match(capacity, /oldest pending memo/i);
});

test("PSS personnel, records, location, surety, and recruitment controls are explicit", () => {
  const personnel = read("michigan/submission/pss/personnel-entries-and-evidence-checklist.md");
  const records = read("michigan/submission/pss/records-retention-and-closure-plan.md");
  const controls = read("michigan/submission/pss/recruitment-location-and-surety-controls.md");
  const surety = read("michigan/submission/pss/surety-bond-checklist.md");
  assert.match(personnel, /administrative, supervisory, and instructional/i);
  assert.match(personnel, /Department-form/i);
  assert.match(records, /at least three years/i);
  assert.match(records, /Grades and transcripts.*perpetually/is);
  assert.match(records, /transfers records to the Board|transfer.*Board/is);
  assert.match(controls, /prior notice/i);
  assert.match(controls, /blind advertisement|help-wanted/i);
  assert.match(controls, /does not induce a person to leave another educational institution/i);
  assert.match(controls, /student who is enrolled in another school.*paid that other school a deposit.*change/is);
  assert.match(surety, /stop enrollment immediately/i);
  assert.match(surety, /replacement surety/i);
  assert.match(read("michigan/submission/pss/student-contract-and-catalog-controls.md"), /all parties agree to the modification in writing/i);
  assert.match(read("michigan/submission/pss/student-catalog-draft.md"), /all parties agree to the modification in writing/i);
  assert.match(read("michigan/submission/pss/enrollment-agreement-draft.md"), /all parties agree to the modification in writing/i);
  assert.match(records, /last attendance, withdrawal, cancellation, or termination/i);
});

test("the Michigan support promise has a load cap and enrollment pause", () => {
  const capacity = read("michigan/submission/pss/student-support-capacity-plan.md");
  const inquiry = read("michigan/submission/regulator-inquiries/PSS-prefiling-inquiry.md");
  assert.match(capacity, /25 concurrently active Michigan students per BPL-approved(?: and PSS-acceptable)? instructor/i);
  assert.match(capacity, /26th active student is refused or wait-listed/i);
  assert.match(capacity, /Enrollment pauses earlier/i);
  assert.match(capacity, /another instructor.*approved by BPL/is);
  assert.match(inquiry, /student-to-instructor load/i);
});

test("catalog and agreement carry the complete controlled complaint procedure", () => {
  for (const relative of [
    "michigan/submission/pss/student-catalog-draft.md",
    "michigan/submission/pss/enrollment-agreement-draft.md",
  ]) {
    const text = read(relative);
    assert.match(text, /MI-COMPLAINT-1\.0-submission-draft/);
    assert.match(text, /three business days/i);
    assert.match(text, /ten business days/i);
    assert.match(text, /directly to PSS|contact PSS at any time|file directly with PSS at any time/i);
    assert.match(text, /without.*retaliat|will not.*retaliat|protected against.*retaliat/is);
  }
});

test("the package refund calculation covers both Complete Licensing Path allocations", () => {
  for (const relative of [
    "michigan/submission/pss/student-contract-and-catalog-controls.md",
    "michigan/submission/pss/student-catalog-draft.md",
    "michigan/submission/pss/enrollment-agreement-draft.md",
  ]) {
    const text = read(relative);
    assert.match(text, /same unearned percentage/i);
    assert.match(text, /\$199 qualifying-course allocation and the \$100 noncredit allocation/i);
    assert.match(text, /whether or not a noncredit feature was opened/i);
    assert.match(text, /ordinary student-withdrawal policy pays no refund after more than 60% refund-calculation completion or certificate issuance/i);
    assert.match(text, /validated active instructional minutes completed divided by 2,400 required minutes/i);
    assert.match(text, /600 validated instructional minutes equals 25%/i);
    assert.match(text, /written eligibility decision and calculation within three business days/i);
    assert.match(text, /within 10 business days after the effective cancellation or withdrawal date/i);
  }
});

test("active students are protected when authorization, approval, instructor authority, or surety lapses", () => {
  for (const relative of [
    "michigan/submission/pss/student-contract-and-catalog-controls.md",
    "michigan/submission/pss/student-catalog-draft.md",
    "michigan/submission/pss/enrollment-agreement-draft.md",
    "michigan/submission/pss/recruitment-location-and-surety-controls.md",
  ]) {
    const text = read(relative);
    assert.match(text, /school authorization.*program approval.*course approval.*instructor approval.*surety/is);
    assert.match(text, /(?:suspend|cannot continue).*credited instruction.*completion.*certificates.*completion reports\/exports/is);
    assert.match(text, /restoration or teach-out/i);
    assert.match(text, /ordinary 60%\/certificate cutoff does not|without applying the ordinary 60%\/certificate cutoff/i);
    assert.match(text, /complaint.*bond.*rights remain intact/is);
  }
});

test("the application and agreement retain every separate regulatory acknowledgment", () => {
  for (const relative of [
    "michigan/submission/bpl/enrollment-application.md",
    "michigan/submission/pss/enrollment-agreement-draft.md",
  ]) {
    const text = read(relative);
    assert.match(text, /checkbox\/initials|separately initials/i);
    assert.match(text, /36 months before the licence application/i);
    assert.match(text, /completion of 100%/i);
    assert.match(text, /maintains(?: and reports)?(?: the)? records Michigan requires|maintains.*student record.*reports/is);
    assert.match(text, /(?:educational|education).*not legal.*lending.*appraisal.*tax.*brokerage advice/is);
    assert.match(text, /controlled disclosure version.*date\/time/is);
  }
});

test("catalog and agreement define objective school-initiated termination and refund treatment", () => {
  for (const relative of [
    "michigan/submission/pss/student-contract-and-catalog-controls.md",
    "michigan/submission/pss/student-catalog-draft.md",
    "michigan/submission/pss/enrollment-agreement-draft.md",
  ]) {
    const text = read(relative);
    assert.match(text, /documented identity fraud or credential sharing/i);
    assert.match(text, /at least five business days to respond/i);
    assert.match(text, /appeal in writing to the programme coordinator/i);
    assert.match(text, /no discretionary dismissal/i);
    assert.match(text, /same refund calculation and payment deadline as a student withdrawal/i);
    assert.match(text, /does not create automatic tuition forfeiture/i);
  }
});

test("the assessment annex does not collide with attachment 4", () => {
  const pkg = read("michigan/submission/course-approval-package.md");
  assert.match(pkg, /Attachment 4 is the separate asynchronous-attestation form/);
  assert.doesNotMatch(pkg, /assessments?.*supplied at Attachment 4/i);
});

test("the official BPL PDF carries exact controlled draft values and leaves agency/signature fields blank", () => {
  const relative = "michigan/submission/generated/Prelicensure-Course-Approval-Application-DRAFT-UNSIGNED.pdf";
  const raw = fs.readFileSync(path.join(root, relative)).toString("latin1");
  const fieldObject = (name) => {
    const marker = `/T (${name})`;
    const start = raw.indexOf(marker);
    assert.notEqual(start, -1, `${name} is missing from the official PDF`);
    const end = raw.indexOf("endobj", start);
    assert.notEqual(end, -1, `${name} PDF object is unterminated`);
    return raw.slice(start, end);
  };
  assert.match(fieldObject("Course Name"), /\/V \(Principles of Real Estate \\055 Michigan Salesperson Prelicensure\)/);
  assert.match(fieldObject("Real Estate School Name"), /\/V \(StateCourse LLC\)/);
  assert.match(fieldObject("AddressRow1"), /\/V \(407 N Pacific Coast Highway\\054 Unit 1028\\054 Redondo Beach\\054 CA 90277\)/);
  assert.doesNotMatch(fieldObject("AddressRow1"), /Hwy/);
  assert.doesNotMatch(fieldObject("MI Proprietary School Number"), /\/V\s/);
  assert.doesNotMatch(fieldObject("Date"), /\/V\s/);
  assert.doesNotMatch(fieldObject("Signature of Coordinator"), /\/V\s/);
});

test("the PSS route is required but not guessed, and pre-filing readiness is explicit", () => {
  const [index, inquiry, advertising, equipment] = [
    read("michigan/submission/00-filing-index.md"),
    read("michigan/submission/regulator-inquiries/PSS-prefiling-inquiry.md"),
    read("michigan/submission/pss/proposed-advertising-record.md"),
    read("michigan/submission/pss/equipment-platform-list.md"),
  ];
  assert.match(index, /exact MiPSS application category.*await/i);
  assert.match(index, /pre-PSS-filing gates/i);
  assert.match(inquiry, /Proprietary School.*Out-of-State Distance Education Provider/is);
  assert.match(inquiry, /temporary permit/i);
  assert.match(advertising, /every public StateCourse website page/i);
  assert.match(equipment, /To implement and acceptance-test before PSS filing/);
});

test("the syllabus carries complete coordinator and instructor contact fields", () => {
  const syllabus = read("michigan/submission/bpl/syllabus.md");
  assert.match(syllabus, /Coordinator address and telephone.*407 N Pacific Coast Highway.*\(310\) 686-5053/);
  assert.match(syllabus, /Instructor address and telephone.*407 N Pacific Coast Highway.*\(310\) 686-5053/);
  assert.match(syllabus, /Shared email.*info@statecourse\.com/);
});

test("Michigan's August 31 source control and both regulators flow into public data", () => {
  const publicCourse = catalog.categories
    .flatMap((category) => category.programs ?? [])
    .flatMap((program) => program.courses ?? [])
    .find((course) => course.course_id === "mi-salesperson-prelicensure-40-v1");
  assert.equal(courseConfig.source_control_date, "2026-08-31");
  assert.equal(michigan.last_regulatory_review, "2026-08-31");
  assert.match(michigan.secondary_regulator_url, /michigan\.gov\/leo\/bureaus-agencies\/wd\/pss/);
  assert.match(publicCourse.regulator, /Bureau of Professional Licensing/);
  assert.match(publicCourse.regulator, /Post Secondary Schools/);
  assert.equal(courseConfig.completion_rules.final_exam_offered_by_provider, false);
});
