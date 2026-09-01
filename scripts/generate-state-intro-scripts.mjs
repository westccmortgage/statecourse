#!/usr/bin/env node
/**
 * Generates the per-jurisdiction introductory video scripts and the manifest the site
 * reads once a video exists for a state.
 *
 * The scripts are generated from the state registry and course catalog rather than
 * written by hand, for one reason: a recorded video is the hardest thing in the project
 * to correct. A script that claims a course is approved, or that a course exists where
 * it does not, becomes a file on a CDN that outlives the correction. Driving the status
 * language from the data means no script can assert something the registry does not
 * support, and regenerating after a status change reveals exactly which videos must be
 * re-recorded.
 *
 * Compliance constraints enforced here, from Commissioner's Regulation 3004 and RE 303:
 *
 *   3004(a)  advertising must clearly identify the entity and include its name
 *   3004(b)  approved-course advertising must list the DRE course approval number
 *   3004(c)  nothing may imply a course can be completed in less time than its approved hours
 *   3004(d)  no false or misleading statements
 *   RE 303   an offering may not be promoted as DRE-approved until approval issues
 *
 * And the project's own rule: an informational video never counts as instructional time
 * and never unlocks regulated content.
 *
 * Run:  node scripts/generate-state-intro-scripts.mjs
 * Out:  marketing/state-intros/<CODE>-<slug>.md   recording scripts
 *       public/statecourse/data/state-intros.json  site manifest
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROVIDER } from "../config/california/submission-facts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public/statecourse");
const scriptDir = path.join(root, "marketing/state-intros");

const registry = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/state-registry.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/course-catalog.json"), "utf8"));
const courses = catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => program.courses ?? []);

/* The legal entity name, which 3004(a) requires the advertisement to include.
   Taken from config/california/submission-facts.mjs rather than restated here. It used to be
   restated, as "state course LLC", which is not the name of anything: the entity is
   StateCourse LLC. Every one of the 51 generated scripts carried it. A second copy of a legal
   name is a second thing to get wrong, so there is now one. */
const LEGAL_ENTITY_NAME = PROVIDER.legalName;
const BRAND = "StateCourse";

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* Forty jurisdictions carry placeholder registry values - the regulator name is literally
   "Regulator research pending" and there is no hour figure. A script generated from those
   reads "regulated by the Regulator research pending", and promises an outline of
   requirements that does not exist. There is nothing honest to say about those states yet,
   so they get a blocked stub naming what is missing rather than a recordable script. */
function isResearched(state) {
  const named = state.regulator_name && !/pending|research|tbd|unknown/i.test(state.regulator_name);
  return Boolean(named && state.prelicense_hours);
}

/* Status language is chosen from the data, never from prose. Approval wording is only
   reachable when the registry actually carries an approval number. */
function statusLanguage(state, stateCourses) {
  if (state.provider_approval_number) {
    return {
      key: "approved",
      headline: `${BRAND} is an approved course provider in ${state.state_name}.`,
      body: [
        `Our ${state.state_name} courses are approved by the ${state.regulator_name}, under approval number ${state.provider_approval_number}.`,
        "You can enroll and receive credit toward your licensing requirement."
      ]
    };
  }
  if (state.public_status === "In Development" && stateCourses.length) {
    return {
      key: "in_development",
      headline: `${BRAND} is building courses for ${state.state_name}, and they are not approved yet.`,
      body: [
        `We are developing ${stateCourses.length === 1 ? "one course" : `${stateCourses.length} courses`} for ${state.state_name}: ${stateCourses.map((course) => course.course_title).join(", ")}.`,
        `These courses have not been approved by the ${state.regulator_name}. You cannot enroll in them, and they do not currently earn credit toward any licensing requirement.`,
        "We will say so here, plainly, when that changes."
      ]
    };
  }
  if (state.public_status === "In Development") {
    return {
      key: "in_development_framework",
      headline: `${BRAND} is researching ${state.state_name}, and is not offering courses there yet.`,
      body: [
        `We have mapped the ${state.state_name} requirements but have not built or submitted courses for approval by the ${state.regulator_name}.`,
        "You cannot enroll, and nothing here earns credit toward a licensing requirement."
      ]
    };
  }
  return {
    key: "coming_soon",
    headline: `${BRAND} does not offer courses in ${state.state_name} yet.`,
    body: [
      `We have not built or submitted any course for approval by the ${state.regulator_name}.`,
      `What follows is an outline of what ${state.state_name} requires, so you know what to look for — whether or not you ever study with us.`
    ]
  };
}

/* Hours are read from the registry so a script cannot understate them, which 3004(c)
   prohibits. Where the registry has no figure, the script says so rather than guessing. */
function requirementLines(state) {
  const lines = [];
  lines.push(`Real estate licensing in ${state.state_name} is regulated by the ${state.regulator_name}.`);

  if (state.prelicense_hours) {
    lines.push(`The pre-license education requirement is ${state.prelicense_hours} hours. That is the requirement as we record it; the regulator's own published requirements always control, and you should confirm them directly.`);
  } else {
    lines.push("We have not yet recorded a verified pre-license hour requirement for this state. Check with the regulator directly.");
  }

  if (state.allowed_delivery_methods?.length) {
    lines.push(`Approved courses may be delivered by: ${state.allowed_delivery_methods.join(", ")}.`);
  }
  if (state.course_approval_required) {
    lines.push("Courses must be approved by the regulator before they count toward the requirement. A course that is not approved earns nothing, however good it is.");
  }
  if (state.instructor_approval_required) {
    lines.push("Instructors must also be qualified or approved.");
  }
  return lines;
}

function missingForRecording(state) {
  const missing = [];
  if (!state.regulator_name || /pending|research|tbd|unknown/i.test(state.regulator_name)) missing.push("verified regulator name");
  if (!state.regulator_url) missing.push("regulator source URL");
  if (!state.prelicense_hours) missing.push("verified pre-license hour requirement");
  if (!state.allowed_delivery_methods?.length) missing.push("permitted delivery methods");
  return missing;
}

function buildScript(state) {
  const stateCourses = courses.filter((course) => course.state_id === state.state_code);
  const missing = missingForRecording(state);
  if (!isResearched(state)) return { state, stateCourses, blocked: true, missing, status: { key: "not_researched" }, segments: [] };
  const status = statusLanguage(state, stateCourses);

  const segments = [
    {
      id: "identification",
      seconds: 8,
      lines: [
        `This is ${BRAND}, from ${LEGAL_ENTITY_NAME}.`,
        `A short introduction to real estate licensing in ${state.state_name}.`
      ]
    },
    {
      id: "requirement",
      seconds: 30,
      lines: requirementLines(state)
    },
    {
      id: "status",
      seconds: 25,
      lines: [status.headline, ...status.body]
    },
    {
      id: "close",
      seconds: 12,
      lines: [
        `Everything we know about ${state.state_name} requirements is on this page, with links to the regulator's own sources.`,
        "If anything here disagrees with the regulator, the regulator is right and we want to know about it."
      ]
    },
    {
      id: "disclaimer",
      seconds: 10,
      lines: [
        "This video is information about licensing requirements. It is not instruction, it does not count toward any course or study-time requirement, and watching it earns no credit."
      ]
    }
  ];

  return { state, stateCourses, status, segments };
}

function toMarkdown({ state, stateCourses, status, segments, blocked, missing }) {
  if (blocked) {
    return [
      `# ${state.state_name} — introductory video: NOT READY TO RECORD`,
      "",
      `**Jurisdiction:** ${state.state_name} (${state.state_code})`,
      `**Public status:** ${state.public_status}`,
      `**Status treatment:** \`not_researched\``,
      "",
      "> **Do not record a video for this jurisdiction.** The registry does not yet hold verified",
      "> information about it, so there is nothing accurate to say. A script generated from the",
      "> current data would state that licensing is regulated by \"Regulator research pending\" and",
      "> would promise an outline of requirements that does not exist.",
      "",
      "## What is missing",
      "",
      ...missing.map((item) => `- ${item}`),
      "",
      "## What to do",
      "",
      "1. Research the jurisdiction against the regulator's own published sources.",
      "2. Record the verified values in `public/statecourse/data/state-registry.json`.",
      "3. Regenerate: `node scripts/generate-state-intro-scripts.mjs`.",
      "4. A recordable script will replace this file once the data supports one.",
      "",
      "Producing a video before that point would be advertising a jurisdiction we have not",
      "researched, which is the kind of statement Regulation 3004(d) addresses.",
      ""
    ].join("\n");
  }

  const totalSeconds = segments.reduce((sum, segment) => sum + segment.seconds, 0);
  const out = [];

  out.push(`# ${state.state_name} — introductory video script`);
  out.push("");
  out.push(`**Jurisdiction:** ${state.state_name} (${state.state_code})`);
  out.push(`**Regulator:** ${state.regulator_name}`);
  out.push(`**Public status:** ${state.public_status}`);
  out.push(`**Status treatment:** \`${status.key}\``);
  out.push(`**Target length:** approximately ${totalSeconds} seconds`);
  out.push("");
  out.push("> **Generated file — do not edit by hand.** Produced by");
  out.push("> `scripts/generate-state-intro-scripts.mjs` from `data/state-registry.json` and");
  out.push("> `data/course-catalog.json`. Editing the script here would let it drift from the");
  out.push("> data it is supposed to reflect. Change the registry, then regenerate.");
  out.push("");

  if (status.key === "approved") {
    out.push("> **Approval claimed.** This script asserts approval because the registry carries an");
    out.push("> approval number for this state. Verify that number against the regulator before");
    out.push("> recording — Regulation 3004(b) requires approved-course advertising to list it.");
    out.push("");
  } else {
    out.push("> **No approval claimed.** This script states plainly that nothing here is approved and");
    out.push("> that no credit is earned. Do not soften that language when recording. RE 303:");
    out.push("> offerings *\"may not be promoted as being DRE-approved until actual approval is issued.\"*");
    out.push("");
  }

  out.push("## Script");
  out.push("");
  for (const segment of segments) {
    out.push(`### ${segment.id} — ~${segment.seconds}s`);
    out.push("");
    for (const line of segment.lines) out.push(`> ${line}`);
    out.push("");
  }

  out.push("## On-screen text");
  out.push("");
  out.push("| When | Text |");
  out.push("| --- | --- |");
  out.push(`| Open | ${BRAND} · ${LEGAL_ENTITY_NAME} |`);
  out.push(`| Requirement | ${state.prelicense_hours ? `${state.prelicense_hours} hours pre-license education` : "Hour requirement not yet verified"} |`);
  out.push(`| Status | ${status.key === "approved" ? `Approval no. ${state.provider_approval_number}` : "Not approved — no credit available"} |`);
  out.push(`| Close | ${state.regulator_url ?? state.regulator_name} |`);
  out.push("");

  if (stateCourses.length) {
    out.push("## Courses referenced");
    out.push("");
    out.push("| Course | Hours | Approval status | Enrollment |");
    out.push("| --- | ---: | --- | --- |");
    for (const course of stateCourses) {
      out.push(`| ${course.course_title} | ${course.required_hours ?? "—"} | ${course.approval_status} | ${course.enrollment_enabled ? "Enabled" : "Disabled"} |`);
    }
    out.push("");
  }

  out.push("## Recording notes");
  out.push("");
  out.push("- **Captions are required.** A WebVTT caption file must accompany the video. RE 303 notes the");
  out.push("  ADA obligation to offer courses and examinations accessibly, and this is the cheapest place");
  out.push("  to meet it.");
  out.push("- **A transcript must be published** alongside the video on the page.");
  out.push("- **Do not add claims while recording.** Anything not in this script is not in the data.");
  out.push("- **Do not state or imply a completion time** shorter than the hours above. Regulation 3004(c)");
  out.push("  prohibits advertising that implies a course can be completed in less time than its approved hours.");
  out.push("- **Re-record when the status changes.** Regenerate these scripts after any registry change and");
  out.push("  compare; a changed script means the recorded video is now inaccurate.");
  out.push("");

  return out.join("\n");
}

fs.mkdirSync(scriptDir, { recursive: true });
for (const existing of fs.readdirSync(scriptDir)) {
  if (existing.endsWith(".md")) fs.unlinkSync(path.join(scriptDir, existing));
}

const manifest = { version: 1, generated_from: ["data/state-registry.json", "data/course-catalog.json"], states: [] };
const counts = {};

for (const state of registry.states) {
  const script = buildScript(state);
  const name = `${state.state_code}-${slugify(state.state_name)}.md`;
  fs.writeFileSync(path.join(scriptDir, name), `${toMarkdown(script)}\n`);

  counts[script.status.key] = (counts[script.status.key] ?? 0) + 1;
  manifest.states.push({
    state_code: state.state_code,
    state_name: state.state_name,
    script: `marketing/state-intros/${name}`,
    status_treatment: script.status.key,
    /* True where the registry lacks verified data, so no video may be produced yet. */
    blocked: Boolean(script.blocked),
    /* Populated when a video is actually produced. Absent means the page shows no video. */
    src: null,
    poster: null,
    captions: null,
    transcript: null,
    /* Never instruction. The reader and the compliance engine must never treat this as
       study time or as a prerequisite that unlocks regulated content. */
    regulatedInstruction: false
  });
}

fs.writeFileSync(path.join(publicRoot, "data/state-intros.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`wrote ${registry.states.length} scripts to marketing/state-intros/`);
for (const [key, value] of Object.entries(counts)) console.log(`  ${key.padEnd(24)} ${value}`);
console.log("wrote public/statecourse/data/state-intros.json");
