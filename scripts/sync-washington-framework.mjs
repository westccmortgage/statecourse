import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const definitions = [
  {
    id: "wa-real-estate-fundamentals-60-v1",
    base: "washington/wa-real-estate-fundamentals-60-v1",
    route: "public/statecourse/real-estate/washington/pre-license/fundamentals/index.html",
    units: 60,
    exam: 180,
  },
  {
    id: "wa-real-estate-practices-30-v1",
    base: "washington/wa-real-estate-practices-30-v1",
    route: "public/statecourse/real-estate/washington/pre-license/practices/index.html",
    units: 30,
    exam: 90,
  },
];

const controlsPath = path.join(root, "config/state-regulatory-controls.json");
const frameworksPath = path.join(root, "public/statecourse/data/launch-course-frameworks.json");
const registryPath = path.join(root, "public/statecourse/data/state-registry.json");
const controls = JSON.parse(fs.readFileSync(controlsPath, "utf8"));
const frameworks = JSON.parse(fs.readFileSync(frameworksPath, "utf8"));

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
  lms.delivery.regulatory_basis = "WAC 308-124H-830 through -845";
  lms.delivery.inactivity_shutdown_required = true;
  lms.delivery.student_and_school_clock_hour_certification = true;
  lms.assessment.questions_per_form = definition.exam;
  lms.assessment.passing_percent = 70;
  lms.assessment.passing_percent_source = "WAC 308-124H-820(8)";
  lms.assessment.production_bank_status = "not_started_release_gate";
  lms.content = {
    blueprint_units: definition.units,
    blueprint_status: "complete_development_draft",
    student_manuscripts_status: "not_complete",
    secure_final_bank_status: "not_complete",
    dol_prescribed_curriculum_acceptance: "pending",
  };
  fs.writeFileSync(lmsPath, `${JSON.stringify(lms, null, 2)}\n`);
  controls.states[definition.id] = lms;

  const framework = frameworks.courses.find((entry) => entry.course_id === definition.id);
  if (!framework) throw new Error(`Missing public framework ${definition.id}`);
  framework.delivery = "Asynchronous distance delivery proposed under WAC 308-124H-830 through -845; DOL or qualifying ARELLO acceptance pending";
  framework.modules = lms.modules.map(({ id, title, hours }) => ({ id, title, hours }));
  framework.public_notice = `Development: verified Washington controls and ${definition.units}-unit blueprint complete. Student manuscripts and the unique secure ${definition.exam}-question final remain in development. Not approved; enrollment, payment, credit, and certificates are unavailable.`;

  const publicPath = path.join(root, definition.route);
  let html = fs.readFileSync(publicPath, "utf8");
  html = html.replace(
    "the curriculum and submission package are built for regulator review. Public enrollment remains unavailable until approval is recorded.",
    `the verified regulatory controls and ${definition.units}-unit blueprint are complete drafts. Student manuscripts and the unique secure ${definition.exam}-question final remain in development. Public enrollment remains unavailable until approval is recorded.`,
  );
  html = html.replace(
    "Course-specific Distance Education Delivery Method Application, or an accepted ARELLO certificate for the same course and clock-hour controls.",
    `Proposed distance delivery applies 50-minute clock hours, interactive progress checks, individual remediation, inactivity shutdown, identity/completion certification and instructor access. DOL approval or qualifying ARELLO evidence remains pending.`,
  );
  fs.writeFileSync(publicPath, html);
}

controls.last_regulatory_review = "2026-08-17";
frameworks.last_regulatory_review = "2026-08-17";
fs.writeFileSync(controlsPath, `${JSON.stringify(controls, null, 2)}\n`);
fs.writeFileSync(frameworksPath, `${JSON.stringify(frameworks, null, 2)}\n`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const washington = registry.states.find((entry) => entry.state_code === "WA");
if (!washington) throw new Error("Missing Washington registry record");
washington.notes = "Separate development records: 60-hour Fundamentals and 30-hour Practices. Verified controls include 50-minute clock hours, interactive distance delivery, inactivity shutdown, individual remediation, five-year records, 180/90-question finals and 70% minimum passing grade. No approval or enrollment claim.";
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

console.log("Synchronized Washington course configs, national controls, public frameworks, pages, and state registry.");
