import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../public/statecourse/data/state-registry.json", import.meta.url);
const registry = JSON.parse(await readFile(file, "utf8"));
const launch = new Set(["VA", "ME", "WI", "MO", "OK", "AZ", "WA", "PA", "NC", "CO"]);

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

replace("AZ", {
  regulator_name: "Arizona Department of Real Estate",
  regulator_url: "https://azre.gov/",
  provider_status: "In Development",
  allowed_delivery_methods: ["Synchronous distance", "Asynchronous distance", "Classroom — only as separately approved"],
  asynchronous_online_allowed: true,
  instructor_approval_required: true,
  prelicense_hours: 90,
  course_approval_required: true,
  reporting_requirements: "ADRE reviewer credentials, identity/timing/IP/unit/assessment audit exports, certificates, and school/course/instructor change records.",
  record_retention_period: "Approval-package retention term pending ADRE filing confirmation; full regulated event records configured.",
  refund_policy_rules: "Arizona school enrollment agreement and course-specific refund/cancellation policy pending business/legal review and ADRE filing.",
  enrollment_period: "Course-access period pending approved enrollment agreement; 90-hour certificate validity and separate Contract Writing certificate timing disclosed independently.",
  final_exam_rules: "90-hour prelicense final: 75% passing, 2:1 bank ratio, final outside instructional hours, SPS 2025.01 controls. Contract Writing remains a separate course record.",
  proctoring_rules: "ADRE-compliant proctored prelicense final; exam not delivered on a student-supplied device. Contract Writing uses its own approved configuration.",
  certificate_rules: "ADRE school/course/student/start/end/hours/contact/signature fields and verification configured; separate certificates for 90h and 6h courses.",
  notes: "Two separate regulatory records: Arizona Salesperson Pre-License 90h v1.0 and Arizona Contract Writing 6h v1.0. Not approved; enrollment disabled.",
  public_status: "In Development",
  course_ids: ["az-salesperson-prelicense-90", "az-contract-writing-6"]
});

replace("WA", {
  regulator_name: "Washington State Department of Licensing",
  regulator_url: "https://dol.wa.gov/professional-licenses/real-estate-educators",
  provider_status: "In Development",
  allowed_delivery_methods: ["Distance Education Delivery Method approval", "ARELLO-certified delivery when accepted for the same course"],
  asynchronous_online_allowed: true,
  instructor_approval_required: true,
  prelicense_hours: 90,
  course_approval_required: true,
  reporting_requirements: "Five-year school/student/exam/evaluation records, completion certificates, DOL observation/audit access, and material-change submissions.",
  record_retention_period: "5 years",
  refund_policy_rules: "School student publication and course-specific enrollment/refund policy pending DOL application acceptance.",
  enrollment_period: "School policy subject to DOL-approved publication and course configuration.",
  final_exam_rules: "Minimum three questions per clock hour and at least 90 items for 30+ hour courses; 70% passing. Fundamentals bank 180; Practices bank 90.",
  proctoring_rules: "Secure school final. No separate universal proctor requirement is imported where WAC 308-124H does not state one.",
  certificate_rules: "WAC 308-124H-855 completion certificate fields configured separately for each course.",
  notes: "Two separate approvals: Real Estate Fundamentals 60h v1.0 and Real Estate Practices 30h v1.0. School, instructor, each course, and distance method tracked independently.",
  public_status: "In Development",
  course_ids: ["wa-real-estate-fundamentals-60", "wa-real-estate-practices-30"]
});

replace("PA", {
  regulator_name: "Pennsylvania Real Estate Commission",
  regulator_url: "https://www.pa.gov/agencies/dos/department-and-offices/bpoa/boards-commissions/real-estate-commission/education-information",
  provider_status: "In Development",
  allowed_delivery_methods: ["Distance delivery with ARELLO/IDECC or another Commission-accepted method approval", "Classroom — only as separately approved"],
  asynchronous_online_allowed: true,
  ARELLO_required: true,
  ARELLO_status: "Required for proposed distance delivery unless another Commission-approved body is accepted",
  instructor_approval_required: true,
  prelicense_hours: 75,
  course_approval_required: true,
  reporting_requirements: "Commission inspection/audit access, transcripts/certificates, course and instructor records, annual provider/instructor/course renewals.",
  record_retention_period: "Numeric term is a filing-confirmation gate; Chapter 35 administrative, scholastic, course, financial, transcript, and exam records configured.",
  refund_policy_rules: "Written enrollment agreement and refund policy are provider-application exhibits; final policy version remains approval-gated.",
  enrollment_period: "Provider policy pending Commission application acceptance.",
  final_exam_rules: "Separate proctored finals for 30h Fundamentals and 45h Practice. No passing percentage is invented where the controlling source does not specify it.",
  proctoring_rules: "Prelicense final examinations proctored under 49 Pa. Code § 35.358.",
  certificate_rules: "Separate transcript/completion evidence for each course, exact course/version/approval fields, issuance disabled pending approval.",
  notes: "Two separate approval records: Real Estate Fundamentals 30h v1.0 and Real Estate Practice 45h v1.0. $10,000 surety bond and owner/director/provider approvals are separate gates.",
  public_status: "In Development",
  course_ids: ["pa-real-estate-fundamentals-30", "pa-real-estate-practice-45"]
});

replace("NC", {
  regulator_name: "North Carolina Real Estate Commission",
  regulator_url: "https://www.ncrec.gov/Education/",
  provider_status: "In Development",
  allowed_delivery_methods: ["Asynchronous distance", "Synchronous distance", "Blended", "In person — only as approved for Prelicensing"],
  asynchronous_online_allowed: true,
  instructor_approval_required: true,
  prelicense_hours: 75,
  course_approval_required: true,
  reporting_requirements: "Completion report within 7 calendar days; prior-month summary by the fifth day; prescribed roster fields; audit-ready source records.",
  record_retention_period: "3 years",
  refund_policy_rules: "PPD must disclose fees, refund/cancellation and course policies before payment; signed receipt retained.",
  enrollment_period: "180 days from enrollment for the Broker Prelicensing course.",
  final_exam_rules: "Proctored, closed-book, identity-verified end-of-course examination; minimum 75% passing.",
  proctoring_rules: "Approved proctoring with identity verification and closed-book security for distance/blended/synchronous delivery.",
  certificate_rules: "Course completion certificate and exact 7-day regulator roster/report event configured.",
  notes: "75-hour Broker Prelicensing v1.0. Asynchronous Prelicensing is configured under the current 58H rules; synchronous attendance includes the July 1, 2026 camera-visibility requirement.",
  public_status: "In Development",
  course_ids: ["nc-broker-prelicensing-75"]
});

replace("CO", {
  regulator_name: "Colorado Division of Real Estate + Division of Private Occupational Schools",
  regulator_url: "https://dre.colorado.gov/division-programs/real-estate-broker/education/broker-qualifying-education",
  provider_status: "In Development",
  allowed_delivery_methods: ["DPOS-approved asynchronous/distance delivery", "Other DPOS-approved delivery methods"],
  asynchronous_online_allowed: true,
  ARELLO_required: false,
  ARELLO_status: "No broker-qualifying mandate identified in current DRE/DPOS sources; appraiser rules are not imported",
  instructor_approval_required: true,
  prelicense_hours: 168,
  course_approval_required: true,
  reporting_requirements: "DPOS school/program/student assessments and records plus DRE REC-33 completion evidence for six qualifying courses.",
  record_retention_period: "DPOS approval-specific; full school/program/student/progress/completion records configured pending issued term.",
  refund_policy_rules: "DPOS-approved catalog/enrollment agreement/refund policy; state/course versions remain separate.",
  enrollment_period: "DPOS-approved catalog and agreement control; no national default.",
  final_exam_rules: "Course-specific DPOS-approved assessment configuration; no universal passing score is invented where current DRE materials do not state one.",
  proctoring_rules: "Course/program approval-specific; no rule from another state or Colorado appraiser education is imported.",
  certificate_rules: "Separate REC-33-aligned completion evidence for each mandatory course; six records total 168 hours.",
  notes: "Dual-agency approval path: DPOS school/program authorization plus DRE qualifying-course alignment. Six separate course records total exactly 168 hours.",
  public_status: "In Development",
  course_ids: ["co-real-estate-law-practice-48", "co-contracts-regulations-48", "co-trust-accounts-recordkeeping-8", "co-current-legal-issues-8", "co-real-estate-closings-24", "co-practical-applications-32"]
});

await writeFile(file, `${JSON.stringify(registry, null, 2)}\n`);
