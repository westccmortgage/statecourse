import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { course, modules, allUnits } from "./course-blueprint.mjs";

const target = fileURLToPath(new URL("./hour-by-hour-curriculum.md", import.meta.url));
const lines = [
  `# ${course.title} — Hour-by-Hour Course Blueprint`, "",
  "**Development draft — not approved and not a finished student textbook.**", "",
  "This blueprint defines 72 instructional clock hours and a three-hour comprehensive end-of-course examination. The Commission's March 2024 syllabus major-subject emphasis is marked as recommended; the two half-hour recommendations are balanced into whole StateCourse hour records without changing the 75-hour total.", "",
  "Self-paced distance delivery remains unavailable until NCREC approves this exact delivery method, course copy, time study, identity/attendance method, and proctoring procedure.", "",
  "## Required instructional-unit pattern", "",
  "- source-grounded lesson manuscript and current North Carolina authority;",
  "- stated Bloom-aligned objective at the prescribed instructional level;",
  "- worked example, scenario, document, or calculation;",
  "- student interaction and scored mastery check;",
  "- targeted remediation and alternate assessment;",
  "- server-authoritative unit/assessment completion evidence; and",
  "- immutable course-version and student audit record.", "",
  "## Major-subject emphasis", "",
  "| Module | Course hours | NCREC recommended hours | Authority |", "|---|---:|---:|---|",
  ...modules.map((entry) => `| ${entry.id} — ${entry.title} | ${entry.hours} | ${entry.recommendedHours} | ${entry.authority} |`),
  "|  | **75** | **75** |  |", "",
];

for (const entry of modules) {
  lines.push(`# ${entry.id} — ${entry.title}`, "", `**Course hours:** ${entry.hours}`, "", `**NCREC recommended hours:** ${entry.recommendedHours}`, "", `**Authority:** ${entry.authority}`, "");
  for (const unit of allUnits.filter((value) => value.moduleId === entry.id)) {
    lines.push(`## Unit ${String(unit.hour).padStart(3, "0")} — ${unit.title}`, "", `**Type:** ${unit.type === "exam" ? "Secure end-of-course examination" : "Instruction"}`, "", `**Learning objective:** ${unit.objective}`, "", `**Applied activity / control:** ${unit.application}`, "");
    if (unit.type === "instruction") lines.push("**Manuscript gate:** Complete the explanation, definitions, cited North Carolina authority, worked example, interaction, scored item, feedback, and alternate remediation before submission release.", "");
  }
}

await writeFile(target, `${lines.join("\n").trimEnd()}\n`, "utf8");
