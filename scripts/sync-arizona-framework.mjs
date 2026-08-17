import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lmsPath = path.join(root, "arizona/az-salesperson-prelicense-90-v1/lms-config.json");
const controlsPath = path.join(root, "config/state-regulatory-controls.json");
const frameworksPath = path.join(root, "public/statecourse/data/launch-course-frameworks.json");
const registryPath = path.join(root, "public/statecourse/data/state-registry.json");
const publicCoursePath = path.join(root, "public/statecourse/real-estate/arizona/pre-license/salesperson/index.html");
const lms = JSON.parse(fs.readFileSync(lmsPath, "utf8"));

const controls = JSON.parse(fs.readFileSync(controlsPath, "utf8"));
controls.states[lms.course_id] = lms;
fs.writeFileSync(controlsPath, `${JSON.stringify(controls, null, 2)}\n`);

const frameworks = JSON.parse(fs.readFileSync(frameworksPath, "utf8"));
const framework = frameworks.courses.find((entry) => entry.course_id === lms.course_id);
if (!framework) throw new Error(`Missing framework ${lms.course_id}`);
framework.required_hours = lms.required_hours;
framework.delivery = "Asynchronous distance delivery proposed under ADRE SPS 2025.01; approval pending";
framework.modules = lms.modules.map(({ id, title, hours, layer, units, adre_sections }) => ({
  id,
  title,
  hours,
  layer,
  units,
  ...(adre_sections ? { adre_sections } : {}),
}));
framework.public_notice = "Development: verified regulatory matrix and 90-hour blueprint (63 National Core + 27 Arizona-specific). Student manuscripts and assessment bank remain in development. Not approved; enrollment, payment, credit, and certificates are unavailable.";
frameworks.last_regulatory_review = "2026-08-17";
fs.writeFileSync(frameworksPath, `${JSON.stringify(frameworks, null, 2)}\n`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const arizona = registry.states.find((entry) => entry.state_code === "AZ");
if (!arizona) throw new Error("Missing Arizona state registry record");
arizona.notes = "Separate development records: 90-hour salesperson course with a 63-hour National Core and proposed 27-hour ADRE-specific layer, plus a separate 6-hour Contract Writing course. No approval or enrollment claim.";
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

let publicCourse = fs.readFileSync(publicCoursePath, "utf8");
publicCourse = publicCourse
  .replace(
    "the curriculum and submission package are built for regulator review. Public enrollment remains unavailable until approval is recorded.",
    "the verified regulatory matrix and 90-hour blueprint are complete drafts. Student manuscripts and the secure assessment bank remain in development. Public enrollment remains unavailable until approval is recorded.",
  )
  .replace(
    '<span data-module-count>10 modules</span> totaling <span data-hours>90 hours</span>.',
    '<span data-module-count>20 modules</span> totaling <span data-hours>90 hours</span>: 63-hour National Core plus a proposed 27-hour Arizona-specific layer.',
  )
  .replace(
    "Synchronous or asynchronous distance learning under ADRE SPS 2025.01 and the applicable course application.",
    "Asynchronous distance delivery is proposed under ADRE SPS 2025.01: 50-minute units, 15-minute inactivity logout, identity verification, interactive 75% unit quizzes, audit reporting, and a separately proctored comprehensive final. Approval remains pending.",
  );
if (!publicCourse.includes("63-hour National Core")) throw new Error("Arizona public course update failed");
fs.writeFileSync(publicCoursePath, publicCourse);

console.log("Synchronized Arizona LMS, national controls, public framework, and state registry.");
