import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const definitions = [
  { id: "pa-real-estate-fundamentals-30-v1", base: "pennsylvania/pa-real-estate-fundamentals-30-v1", route: "public/statecourse/real-estate/pennsylvania/pre-license/fundamentals/index.html", units: 30, credits: 2 },
  { id: "pa-real-estate-practice-45-v1", base: "pennsylvania/pa-real-estate-practice-45-v1", route: "public/statecourse/real-estate/pennsylvania/pre-license/practice/index.html", units: 45, credits: 3 },
];
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`);
const controls = readJson("config/state-regulatory-controls.json");
const frameworks = readJson("public/statecourse/data/launch-course-frameworks.json");

for (const definition of definitions) {
  const lmsPath = path.join(root, definition.base, "lms-config.json");
  const lms = JSON.parse(fs.readFileSync(lmsPath, "utf8"));
  const blueprint = await import(pathToFileURL(path.join(root, definition.base, "curriculum/course-blueprint.mjs")));
  lms.modules = blueprint.modules.map((entry) => ({
    id: entry.id,
    title: entry.title,
    hours: entry.hours,
    authority: entry.authority,
    national_core: lms.modules.find((current) => current.id === entry.id)?.national_core ?? [],
  }));
  lms.delivery.regulatory_basis = "49 Pa. Code §§ 35.201 and 35.358; current Commission Distance Education Course Application";
  lms.delivery.instructional_minutes_per_clock_hour = 50;
  lms.delivery.method_approval_required = "ARELLO/IDECC or other Commission-approved comparable certifying body";
  lms.delivery.reviewer_credentials_required = true;
  lms.delivery.inactivity_exclusion = true;
  lms.identity.exam_proctoring = "Required for each prelicense course under 49 Pa. Code § 35.358(b)(2); approved procedure pending";
  lms.assessment.questions_per_form = null;
  lms.assessment.bank_ratio = null;
  lms.assessment.passing_percent = null;
  lms.assessment.passing_percent_source = "not_stated_in_verified_sources_written_confirmation_required";
  lms.assessment.production_bank_status = "not_started_release_gate";
  lms.records.state_rule = "49 Pa. Code § 35.360: complete financial, facility, personnel, curriculum, scholastic and attendance records; prelicense attendance and scholastic records retained 10 years.";
  lms.records.retention_years = 10;
  lms.reporting.state_workflow = "Director-signed official prelicense transcript within 30 days under §§ 35.359–35.360; records available to student and Commission; annual provider renewal due by October 31.";
  lms.content = {
    blueprint_units: definition.units,
    blueprint_status: "complete_development_draft",
    commission_outline_mapping: "complete_development_draft",
    student_manuscripts_status: "not_complete",
    formative_item_bank_status: "not_complete",
    secure_final_bank_status: "not_complete",
    commission_acceptance: "pending",
  };
  fs.writeFileSync(lmsPath, `${JSON.stringify(lms, null, 2)}\n`);
  controls.states[definition.id] = lms;

  const summary = blueprint.modules.map((entry) => {
    const units = blueprint.allUnits.filter((unit) => unit.moduleId === entry.id);
    return { ...entry, start: units[0].hour, end: units.at(-1).hour };
  });
  const timed = [
    `# ${blueprint.course.title} — Timed Course Outline`, "",
    "**Development — not approved — enrollment disabled.**", "",
    `This StateCourse proposal contains ${definition.units} distinct clock-hour units. Each clock hour provides at least 50 minutes of instruction. Individual topic allocations are the provider's proposed implementation of the Commission outline, not Commission-assigned topic hours.`, "",
    "| Module | Subject | Units | Hours | Controlling mapping |", "|---|---|---:|---:|---|",
    ...summary.map((entry) => `| ${entry.id} | ${entry.title} | ${entry.start}–${entry.end} | ${entry.hours} | ${entry.authority} |`),
    `|  | **Total** | **1–${definition.units}** | **${definition.units}** | ${definition.credits} credits |`, "",
    "The required proctored final is outside these instructional hours in this development plan. Final duration, item count, passing score and attempt rules remain written Commission-confirmation gates.", "",
  ];
  fs.writeFileSync(path.join(root, definition.base, "timed-course-outline.md"), timed.join("\n"));
  const crosswalk = [
    `# ${blueprint.course.title} — Commission Outline Crosswalk`, "",
    "| Commission subject | StateCourse module / units | Proposed hours | Evidence |", "|---|---|---:|---|",
    ...summary.map((entry) => `| ${entry.title} | ${entry.id}, Units ${entry.start}–${entry.end} | ${entry.hours} | Timed outline; unit blueprint; objectives; activity and assessment-development records |`),
    `|  | **Total** | **${definition.units}** | Complete course-level blueprint |`, "",
    "Filing QA must compare every blueprint topic to a dated snapshot of the complete Commission outline. Allocations become regulatory delivery commitments only after Commission acceptance.", "",
  ];
  fs.writeFileSync(path.join(root, definition.base, "regulator-outline-crosswalk.md"), crosswalk.join("\n"));

  const framework = frameworks.courses.find((entry) => entry.course_id === definition.id);
  if (!framework) throw new Error(`Missing public framework ${definition.id}`);
  framework.delivery = "Asynchronous distance delivery proposed under 49 Pa. Code § 35.358; ARELLO/IDECC or other Commission-accepted method approval pending";
  framework.modules = lms.modules.map(({ id, title, hours }) => ({ id, title, hours }));
  framework.public_notice = `Development: verified Pennsylvania controls and ${definition.units}-unit Commission-outline blueprint complete. Student manuscripts and the unique secure proctored final remain in development. Not approved; enrollment, payment, credit and transcripts are unavailable.`;

  let html = fs.readFileSync(path.join(root, definition.route), "utf8");
  html = html.replace(/the curriculum and submission package are built for regulator review\. Public enrollment remains unavailable until approval is recorded\./, `the verified regulatory controls and ${definition.units}-unit Commission-outline blueprint are complete drafts. Student manuscripts and the unique secure proctored final are not complete. Public enrollment remains unavailable until approval is recorded.`);
  html = html.replace(/Distance delivery method approved by ARELLO\/IDECC or another Commission-accepted body; prelicense final proctored\./, "Distance delivery requires ARELLO/IDECC or another Commission-accepted method approval. Each course requires a proctored final; the production exam and approved proctor procedure remain release gates.");
  fs.writeFileSync(path.join(root, definition.route), html);
}

controls.last_regulatory_review = "2026-08-17";
frameworks.last_regulatory_review = "2026-08-17";
writeJson("config/state-regulatory-controls.json", controls);
writeJson("public/statecourse/data/launch-course-frameworks.json", frameworks);

const registry = readJson("public/statecourse/data/state-registry.json");
const pennsylvania = registry.states.find((entry) => entry.state_code === "PA");
if (!pennsylvania) throw new Error("Missing Pennsylvania registry record");
pennsylvania.notes = "Separate development records: 30-hour / 2-credit Fundamentals and 45-hour / 3-credit Practice. Verified controls include 50-minute clock hours, Commission-outline conformity, approved distance method, proctored final per course, director-signed transcript within 30 days and 10-year prelicense attendance/scholastic retention. Numeric exam rules remain written-confirmation gates. No approval or enrollment claim.";
writeJson("public/statecourse/data/state-registry.json", registry);

console.log("Synchronized Pennsylvania course configs, national controls, public frameworks, pages, outlines and registry.");
