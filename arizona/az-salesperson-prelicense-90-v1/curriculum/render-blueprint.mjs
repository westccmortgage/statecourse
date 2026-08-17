import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { course, modules, allUnits } from "./course-blueprint.mjs";

const target = fileURLToPath(new URL("./hour-by-hour-curriculum.md", import.meta.url));
const lines = [
  `# ${course.title} — Hour-by-Hour Curriculum Blueprint`,
  "",
  "**Development draft — not an approved course and not a finished student textbook.**",
  "",
  "This controlled blueprint replaces the earlier repeated placeholder prose. It defines 90 distinct 50-minute instructional units, their source layer, measurable objective and applied work. Final lesson manuscripts, media, citations, scored items and accessibility review must be completed and accepted before submission release.",
  "",
  "The secure school final is outside the 90 instructional hours. The separate six-hour Contract Writing course is also outside this record.",
  "",
  "## Delivery pattern for every 50-minute unit",
  "",
  "- source-grounded reading/explanation and examples;",
  "- a scenario-based interactive activity;",
  "- server-authoritative active time with no passive-page credit;",
  "- a scored unit quiz requiring 75%;",
  "- alternate remediation and a new scored item after an incorrect response;",
  "- identity, sequencing and audit controls from the Arizona LMS configuration.",
  "",
  "## Module summary",
  "",
  "| Module | Layer | Hours | Units | Authority |",
  "|---|---|---:|---|---|",
  ...modules.map((module) => {
    const units = allUnits.filter((unit) => unit.moduleId === module.id);
    return `| ${module.id} — ${module.title} | ${module.layer.replace("_", " ")} | ${module.hours} | ${String(units[0].hour).padStart(2, "0")}–${String(units.at(-1).hour).padStart(2, "0")} | ${module.authority} |`;
  }),
  "|  | **Total** | **90** | **1–90** |  |",
  "",
];

for (const module of modules) {
  lines.push(`## ${module.id} — ${module.title}`, "", `**Layer:** ${module.layer.replace("_", " ")}`, "", `**Hours:** ${module.hours}`, "", `**Authority:** ${module.authority}`, "", module.scope, "");
  for (const unit of allUnits.filter((entry) => entry.moduleId === module.id)) {
    lines.push(
      `## Unit ${String(unit.hour).padStart(3, "0")} — ${unit.title}`,
      "",
      `**Learning objective:** ${unit.objective}`,
      "",
      `**Applied activity:** ${unit.application}`,
      "",
      `**Manuscript requirement:** develop the rule/concept, vocabulary, worked example, Arizona or national-source note as applicable, professional-scope boundary, scenario interaction, quiz and alternate remediation. Cite ${unit.authority}.`,
      "",
    );
  }
}

await writeFile(target, `${lines.join("\n").trimEnd()}\n`, "utf8");
