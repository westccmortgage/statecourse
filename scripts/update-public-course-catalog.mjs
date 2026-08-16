import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../public/statecourse/data/course-catalog.json", import.meta.url);
const catalog = JSON.parse(await readFile(file, "utf8"));
const realEstate = catalog.categories.find((category) => category.category_id === "real-estate");
realEstate.programs = realEstate.programs.filter((program) => !["WI", "MO", "OK"].includes(program.state_code));

const course = (values) => ({
  approved_hours: null,
  approval_status: "In Development",
  approval_number: null,
  approval_date: null,
  expiration_date: null,
  instructor_id: null,
  price: null,
  enrollment_enabled: false,
  refund_policy_version: `${values.state_id.toLowerCase()}-draft-pending`,
  disclosures_version: `${values.state_id.toLowerCase()}-draft-pending`,
  course_version: "1.0",
  ...values,
});

realEstate.programs.push(
  { program_id: "wi-salesperson-prelicense", state_code: "WI", program_type: "Salesperson Pre-License", courses: [course({ course_id: "wi-salesperson", state_id: "WI", program_type: "Salesperson Pre-License", course_title: "Wisconsin Salesperson Pre-License", regulator: "Wisconsin Real Estate Examining Board", required_hours: 72, delivery_method: "Online distance education — proposed", final_exam_rules: "StateCourse proposed mastery control pending Board review; no other state's score is imported.", certificate_template: "wi-prelicense-draft", reporting_rules: "REEB 25.055 program records and change controls", route: "/real-estate/wisconsin/pre-license/salesperson/" })] },
  { program_id: "mo-salesperson-prelicense", state_code: "MO", program_type: "Salesperson Pre-License", courses: [
    course({ course_id: "mo-salesperson-preexam-48", state_id: "MO", program_type: "Salesperson Pre-Exam", course_title: "Missouri Salesperson Pre-Exam Course", regulator: "Missouri Real Estate Commission", required_hours: 48, delivery_method: "Online / correspondence / home study — proposed", final_exam_rules: "Two distinct 50-item forms; 75% passing score.", certificate_template: "mo-preexam-48-draft", reporting_rules: "10-day completion roster; January/July time analytics", route: "/real-estate/missouri/pre-license/salesperson-pre-exam/" }),
    course({ course_id: "mo-real-estate-practice-24", state_id: "MO", program_type: "Real Estate Practice", course_title: "Missouri Real Estate Practice Course", regulator: "Missouri Real Estate Commission", required_hours: 24, delivery_method: "Online / correspondence / home study — proposed", final_exam_rules: "Two distinct 50-item forms; 75% passing score.", certificate_template: "mo-practice-24-draft", reporting_rules: "10-day completion roster; January/July time analytics", route: "/real-estate/missouri/pre-license/real-estate-practice/" })
  ] },
  { program_id: "ok-basic-prelicense", state_code: "OK", program_type: "Basic Pre-License", courses: [course({ course_id: "ok-basic-prelicense-90", state_id: "OK", program_type: "Basic Pre-License", course_title: "Oklahoma Basic Pre-License", regulator: "Oklahoma Real Estate Commission", required_hours: 90, delivery_method: "Online distance education — proposed", final_exam_rules: "150 questions minimum; 75% passing score; alternate form available.", certificate_template: "ok-basic-90-draft", reporting_rules: "Five-year records; OREC provider/course lifecycle controls", route: "/real-estate/oklahoma/pre-license/basic/" })] }
);

await writeFile(file, `${JSON.stringify(catalog, null, 2)}\n`);
