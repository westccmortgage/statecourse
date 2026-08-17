import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = "north-carolina/nc-broker-prelicensing-75-v1";
const route = "public/statecourse/real-estate/north-carolina/pre-license/broker/index.html";
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`);
const lmsPath = path.join(root, base, "lms-config.json");
const lms = readJson(`${base}/lms-config.json`);
const blueprint = await import(pathToFileURL(path.join(root, base, "curriculum/course-blueprint.mjs")));

lms.title = "North Carolina Broker Prelicensing 75h";
lms.required_hours = 75;
lms.delivery = {
  mode: "self_paced_distance_proposed",
  approval_pending: true,
  approval_scope: "Specific NCREC approval required for this course and this delivery method",
  active_time_server_authoritative: true,
  instructional_minutes_per_clock_hour: 50,
  time_study_method: "225 words per minute plus actual audio/video duration",
  full_regulator_review_copy_required: true,
  every_unit_and_assessment_required: true,
  idle_time_excluded: true,
  tab_hidden_time_excluded: true,
  disconnected_time_excluded: true,
  concurrent_sessions: false,
  sequential_units: true,
  reviewer_bypass_isolated: true,
  enrollment_validity_days: 180,
};
lms.identity = {
  state_approved_method_pending: true,
  username_password_alone_sufficient: null,
  ip_session_device_audit: true,
  exam_proctoring: "Comprehensive closed-book proctored final; approved identity/security procedure pending",
};
lms.assessment = {
  formative_checks: true,
  remediation_required: true,
  final_hours_in_course: 3,
  final_forms: null,
  questions_per_form: null,
  bank_ratio: null,
  passing_percent: 75,
  passing_percent_source: "21_NCAC_58H_0207_and_NCREC_syllabus",
  comprehensive: true,
  closed_book: true,
  proctored: true,
  retake_attempts: null,
  production_bank_status: "not_started_release_gate",
  written_confirmation_gates: ["item_count", "bank_ratio", "retake_attempts", "retest_interval", "approved_remote_proctor_procedure"],
  secure_bank_public: false,
};
lms.reporting = {
  state_workflow: "Education director submits completion report within seven calendar days and prior-month Prelicensing summary by the fifth day.",
  completion_report_days: 7,
  monthly_summary_due_day: 5,
  automated_events: true,
};
lms.records = {
  state_rule: "21 NCAC 58H .0208: three-year retention of enrollment/attendance, each graded final and answer sheet, master final/key/course dates/instructor, evaluations, advertisements, delivery certifications, official publications/PPD, schedules, student materials, signed receipts and consents.",
  retention_years: 3,
  append_only_completion_audit: true,
  exact_course_version_required: true,
};
lms.certificate = {
  enabled: false,
  template: "nc-broker-prelicensing-75-v1-draft",
  education_director_signature_required: true,
  required_fields: ["course", "completion_date", "student", "instructor"],
  valid_approval_required: true,
  valid_instructor_required: true,
};
lms.content = {
  blueprint_hours: 75,
  instructional_hours: 72,
  end_of_course_exam_hours: 3,
  blueprint_status: "complete_development_draft",
  commission_syllabus_mapping: "complete_development_draft",
  student_manuscripts_status: "not_complete",
  formative_item_bank_status: "not_complete",
  secure_final_bank_status: "not_complete",
  time_study_status: "not_complete",
  commission_acceptance: "pending",
};
lms.fees = {
  provider_initial_per_location: 200,
  prelicense_course_per_branch_location: 40,
  provider_renewal_per_location: 100,
  prelicense_course_renewal: 25,
  instructor_application: null,
  instructor_fee_confirmation_required: true,
  currency: "USD",
  verified_at: "2026-08-17",
};
lms.renewal = {
  provider_expiration: "June 30 annually",
  provider_statutory_filing_deadline: "June 1",
  course_expiration: "June 30 annually",
  course_original_application_after_renewals: 2,
  instructor_expiration: "June 30 annually",
  instructor_renewal_window_days: 45,
  instructor_development_hours: 6,
};
lms.instructor = {
  assigned_instructor_id: null,
  approval_required: true,
  assignment_required_for_enrollment: true,
  required_controls: [
    "active_non_provisional_NC_broker_license",
    "active_status_education_current",
    "60_accredited_semester_hours",
    "qualifying_recent_experience_path",
    "instructor_approval_exam_passed",
    "New_Instructor_Seminar_within_six_months",
    "15_minute_teaching_block_completed",
  ],
};
lms.modules = blueprint.modules.map((entry) => ({
  id: entry.id,
  title: entry.title,
  hours: entry.hours,
  recommended_hours: entry.recommendedHours,
  type: entry.type,
  authority: entry.authority,
  national_core: lms.modules.find((current) => current.title === entry.title)?.national_core ?? [],
}));
writeJson(`${base}/lms-config.json`, lms);

const controls = readJson("config/state-regulatory-controls.json");
controls.states[lms.course_id] = lms;
controls.last_regulatory_review = "2026-08-17";
writeJson("config/state-regulatory-controls.json", controls);

const frameworks = readJson("public/statecourse/data/launch-course-frameworks.json");
const framework = frameworks.courses.find((entry) => entry.course_id === lms.course_id);
if (!framework) throw new Error(`Missing public framework ${lms.course_id}`);
framework.title = lms.title;
framework.delivery = "Self-paced distance proposed; separate NCREC delivery-method approval required";
framework.modules = lms.modules.map(({ id, title, hours, recommended_hours, type }) => ({ id, title, hours, recommended_hours, type }));
framework.public_notice = "Development: verified North Carolina controls and a 75-hour syllabus blueprint are complete. Student manuscripts, formative items, secure final, time study, approved instructor and accepted self-paced delivery remain release gates. Not approved; enrollment, payment and credit are unavailable.";
framework.regulatory_summary = {
  subject_hours: 72,
  proctored_final_hours: 3,
  passing_percent: 75,
  completion_days: 180,
  records_years: 3,
  completion_report_days: 7,
  monthly_summary_due_day: 5,
};
frameworks.last_regulatory_review = "2026-08-17";
writeJson("public/statecourse/data/launch-course-frameworks.json", frameworks);

const registry = readJson("public/statecourse/data/state-registry.json");
registry.last_regulatory_review = "2026-08-17";
const northCarolina = registry.states.find((entry) => entry.state_code === "NC");
if (!northCarolina) throw new Error("Missing North Carolina registry record");
northCarolina.last_regulatory_review = "2026-08-17";
northCarolina.notes = "One 75-hour Broker Prelicensing course. March 2024 NCREC syllabus recommends 72 subject hours plus a three-hour comprehensive final. Self-paced distance requires specific course/delivery approval, full reviewer copy and 225-wpm/audio-video time study. Every unit/assessment, 75% proctored closed-book final, 180-day completion, three-year records, seven-day completion report and day-five monthly summary are configured. Not approved; enrollment disabled.";
writeJson("public/statecourse/data/state-registry.json", registry);

const summary = blueprint.modules.map((entry) => {
  const units = blueprint.allUnits.filter((unit) => unit.moduleId === entry.id);
  return { ...entry, start: units[0].hour, end: units.at(-1).hour };
});
const timed = [
  `# ${blueprint.course.title} — Timed Course Outline`, "",
  "**Development — not approved — enrollment disabled.**", "",
  "This proposal contains 72 distinct 50-minute instructional hours and a three-hour comprehensive end-of-course examination. The NCREC major-subject hours are recommendations; the 1.5/3.5 recommendations are balanced into two/three whole LMS hour records while preserving their combined five hours and the 75-hour total.", "",
  "| Module | Subject | Hour records | Proposed hours | NCREC recommended hours |", "|---|---|---:|---:|---:|",
  ...summary.map((entry) => `| ${entry.id} | ${entry.title} | ${entry.start}–${entry.end} | ${entry.hours} | ${entry.recommendedHours} |`),
  "|  | **Total** | **1–75** | **75** | **75** |", "",
  "A filing time study will show text at 225 words per minute plus actual audio/video duration and will exclude navigation, unscored waiting, technical setup and optional resources.", "",
];
fs.writeFileSync(path.join(root, base, "timed-course-outline.md"), timed.join("\n"));

const crosswalk = [
  `# ${blueprint.course.title} — NCREC Syllabus Crosswalk`, "",
  "| NCREC major subject | StateCourse module / unit records | Proposed hours | Recommended hours | Evidence |", "|---|---|---:|---:|---|",
  ...summary.map((entry) => `| ${entry.title} | ${entry.id}, Units ${entry.start}–${entry.end} | ${entry.hours} | ${entry.recommendedHours} | Timed outline; objective/activity blueprint; manuscript and assessment gates |`),
  "|  | **Total** | **75** | **75** | Complete course-level blueprint |", "",
  "Filing QA must compare every unit to a dated, checksummed copy of the complete NCREC Broker Prelicensing Course Syllabus, including its required activities, referenced resources and instructional levels.", "",
];
fs.writeFileSync(path.join(root, base, "regulator-outline-crosswalk.md"), crosswalk.join("\n"));

const instructorGuide = [
  `# ${blueprint.course.title} — Instructor Guide`, "",
  "**Assignment: unassigned — current NCREC instructor approval required before enrollment.**", "",
  "The assigned instructor supports the exact approved course version. The LMS provides current-source links, objectives, student attempts, remediation history, help requests and version context; it does not replace instructor judgment or Commission approval.", "",
  "## Module responsibilities", "", "| Module | Hours | Instructor control |", "|---|---:|---|",
  ...blueprint.modules.map((entry) => `| ${entry.id} — ${entry.title} | ${entry.hours} | Verify the current syllabus/form/source edition; review objective and assessment mapping; respond to student misconceptions; document interventions; escalate legal or regulator ambiguity. |`),
  "", "## Before release", "",
  "- verify current non-provisional North Carolina broker license and NCREC instructor approval;",
  "- confirm course assignment and approval scope;",
  "- review all 72 student manuscripts, required activities and authorized North Carolina resources;",
  "- validate formative items, rationales and remediation;",
  "- participate in secure final/legal-content review without exposing items;",
  "- complete the approved self-paced support and response-time procedure; and",
  "- verify the exact approved course version before any student cohort begins.", "",
  "The education director, not the instructor alone, signs certificates and owns the Commission reporting and examination-security duties assigned by Rule .0203.", "",
];
fs.writeFileSync(path.join(root, base, "instructor-guide.md"), instructorGuide.join("\n"));

let html = fs.readFileSync(path.join(root, route), "utf8");
html = html.replace(/the curriculum and submission package are built for regulator review\. Public enrollment remains unavailable until approval is recorded\./, "the verified regulatory controls and 75-hour syllabus blueprint are complete drafts. Student manuscripts, formative items, secure final, time study, approved instructor and accepted self-paced delivery are not complete. Public enrollment remains unavailable until approval is recorded.");
html = html.replace(/<span data-module-count>15 modules<\/span>/, `<span data-module-count>${lms.modules.length} modules</span>`);
html = html.replace(/In-person, synchronous distance, blended, or asynchronous distance only as approved for the 75-hour Prelicensing course\. Asynchronous learners complete every unit and assessment; synchronous learners must remain visible on camera effective July 1, 2026\./, "Self-paced distance is permitted only after NCREC approves this course and delivery method. The full course and 225-wpm/audio-video time study must be reviewable; every unit and assessment is required. The final is closed-book, proctored, and identity-secured.");
fs.writeFileSync(path.join(root, route), html);

console.log("Synchronized North Carolina course config, national controls, public framework, page, outlines and registry.");
