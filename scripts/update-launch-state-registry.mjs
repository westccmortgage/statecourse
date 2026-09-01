import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../public/statecourse/data/state-registry.json", import.meta.url);
const registry = JSON.parse(await readFile(file, "utf8"));
const launch = new Set(["VA", "ME", "WI", "MO", "OK"]);

if (!registry.statuses.includes("Coming Soon")) registry.statuses.splice(1, 0, "Coming Soon");

for (const state of registry.states) {
  if (launch.has(state.state_code)) continue;
  state.public_status = "Coming Soon";
  state.notes = "Coming Soon / Not Yet Available. No regulatory claims or enrollment are enabled.";
}

const replace = (code, values) => Object.assign(registry.states.find((state) => state.state_code === code), values);

replace("WI", {
  regulator_name: "Wisconsin Department of Safety and Professional Services / Real Estate Examining Board",
  regulator_url: "https://dsps.wi.gov/Pages/Professions/RESalesperson/Default.aspx",
  provider_status: "In Development",
  allowed_delivery_methods: ["Distance/online delivery subject to school and Board program approval"],
  asynchronous_online_allowed: null,
  instructor_approval_required: true,
  prelicense_hours: 72,
  course_approval_required: true,
  reporting_requirements: "Program and instructor changes reported as required by REEB 25; program records available to the Board.",
  record_retention_period: "5 years",
  refund_policy_rules: "Wisconsin program policy pending provider/legal review and approval package.",
  enrollment_period: "Provider proposal pending Board acceptance.",
  final_exam_rules: "Provider assessment design pending Board acceptance; no Virginia or national pass standard is assumed.",
  proctoring_rules: "No global proctor rule applied; delivery controls remain state/course configured.",
  certificate_rules: "School, student, program, hours, completion date, and authorized signature fields configured.",
  notes: "72-hour Wisconsin Salesperson Pre-License v1.0; 19 REEB 25.033 subject groups mapped. Enrollment and credit remain disabled pending approval.",
  public_status: "In Development",
  course_ids: ["wi-salesperson"]
});

replace("MO", {
  regulator_name: "Missouri Real Estate Commission",
  regulator_url: "https://pr.mo.gov/realestate.asp",
  provider_status: "In Development",
  allowed_delivery_methods: ["Online", "Correspondence", "Home study", "Classroom"],
  asynchronous_online_allowed: true,
  instructor_approval_required: true,
  prelicense_hours: 72,
  course_approval_required: true,
  reporting_requirements: "Completion roster within 10 days; distance completion-time statistics due January 31 and July 31; school/course changes as required.",
  record_retention_period: "4 years",
  refund_policy_rules: "Course contract must state tuition, materials and refund policy; separate course configuration required.",
  enrollment_period: "License application timing and course contract terms disclosed separately from LMS access policy.",
  final_exam_rules: "Each regulatory course has two distinct 50-item multiple-choice forms; 75% course passing standard.",
  proctoring_rules: "Secure final-exam administration method documented in each distance-course application.",
  certificate_rules: "Commission-prescribed completion certificate issued within 10 days after successful completion.",
  notes: "Two separate approval records: 48-hour Salesperson Pre-Exam and 24-hour Missouri Real Estate Practice. A commercial bundle never merges regulatory records.",
  public_status: "In Development",
  course_ids: ["mo-salesperson-preexam-48", "mo-real-estate-practice-24"]
});

replace("OK", {
  regulator_name: "Oklahoma Real Estate Commission",
  regulator_url: "https://oklahoma.gov/orec.html",
  provider_status: "In Development",
  allowed_delivery_methods: ["Distance education subject to OREC provider, course and instructor approval"],
  asynchronous_online_allowed: true,
  instructor_approval_required: true,
  prelicense_hours: 90,
  course_approval_required: true,
  reporting_requirements: "Provider records and completion documentation maintained for Commission review.",
  record_retention_period: "5 years",
  refund_policy_rules: "Oklahoma course-specific provider policy pending legal/business review.",
  enrollment_period: "Distance-course enrollment valid for 6 months under the configured rule.",
  final_exam_rules: "At least 150 questions; 75% passing score; alternate examination available without repeating the course.",
  proctoring_rules: "Distance exam security and engagement controls documented for OREC review.",
  certificate_rules: "OREC-aligned completion certificate and five-year completion record configured.",
  notes: "90-hour Basic Pre-License v1.0. Instructor is unassigned; future OREC-approved contract instructor must meet configured qualifications and 80% state/national exam gates.",
  public_status: "In Development",
  course_ids: ["ok-basic-prelicense-90"]
});

await writeFile(file, `${JSON.stringify(registry, null, 2)}\n`);
