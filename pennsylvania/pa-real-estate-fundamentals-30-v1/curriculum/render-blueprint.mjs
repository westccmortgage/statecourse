import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { course, modules, allUnits } from "./course-blueprint.mjs";

const target = fileURLToPath(new URL("./hour-by-hour-curriculum.md", import.meta.url));
const lines = [
  `# ${course.title} — Unit-by-Unit Curriculum Blueprint`, "",
  "**Development draft — not approved and not a finished student textbook.**", "",
  "This blueprint defines 30 distinct 50-minute instructional units. Topic-hour allocations are StateCourse's submission proposal mapped to the complete Commission Fundamentals outline; the Commission outline specifies required content but does not assign hours to its individual topics.", "",
  "The required proctored final examination is outside the 30 instructional clock hours. The Commission materials reviewed do not state a numeric item count or passing score; those values remain Commission-confirmation and approval gates.", "",
  "## Required delivery pattern", "",
  "- source-grounded lesson manuscript and worked example;", "- scenario-based interactive activity with direct feedback;", "- server-authoritative active-time and inactivity exclusion;", "- scored progress check;", "- individual remediation and alternate assessment;", "- authenticated reviewer access;", "- immutable course-version and completion audit record.", "",
  "## Module summary", "", "| Module | Units | Hours | Authority |", "|---|---:|---:|---|",
  ...modules.map((entry) => { const units = allUnits.filter((unit) => unit.moduleId === entry.id); return `| ${entry.id} — ${entry.title} | ${String(units[0].hour).padStart(2, "0")}–${String(units.at(-1).hour).padStart(2, "0")} | ${entry.hours} | ${entry.authority} |`; }),
  "|  | **1–30** | **30** |  |", "",
];
for (const entry of modules) {
  lines.push(`# ${entry.id} — ${entry.title}`, "", `**Hours:** ${entry.hours}`, "", `**Authority:** ${entry.authority}`, "");
  for (const unit of allUnits.filter((value) => value.moduleId === entry.id)) lines.push(`## Unit ${String(unit.hour).padStart(3, "0")} — ${unit.title}`, "", `**Learning objective:** ${unit.objective}`, "", `**Applied activity:** ${unit.application}`, "", "**Manuscript gate:** complete the explanation, vocabulary, current cited authority, worked example, scope boundary, interaction, scored item and alternate remediation before submission release.", "");
}
await writeFile(target, `${lines.join("\n").trimEnd()}\n`, "utf8");
