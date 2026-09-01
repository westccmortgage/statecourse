/**
 * TX_PRINCIPLES_I_CLAIM_TRACEABILITY — the gate that walks the chain.
 *
 * WHAT THIS GATE IS, AND IS NOT. The SOURCE LOCK (texas-source-lock) asks whether the documents on
 * disk are the documents that were read — reachability and hash integrity. THIS gate asks a
 * different question: whether the curriculum's claims trace to sections actually read. The two are
 * deliberately separate concepts and must not be merged: a lock can hold while a module cites a
 * section nobody opened, and this gate exists to catch exactly that.
 *
 * WHAT IS CHECKED. (1) Every section cited with a § in the nine modules resolves to the
 * SECTIONS_READ register — Texas and federal alike — except the two EXPLAINED_CROSS_REFERENCES,
 * each of which is a reference contained inside the read text of a register section and is taught
 * in the module as exactly that. (2) Sentences that state a dollar or percentage figure as a legal
 * requirement carry a § citation in the same sentence. (3) The Texas curriculum contains no
 * tax-benefit vocabulary — the TX-1A decision for "The Benefits" was option B, and this guard keeps
 * it made. (4) Every quiz item tests a real PRINS1-1 unit and its remediation anchor resolves to a
 * real unit heading in the named module file. (5) Every scenario is placed on a real topic.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { SECTIONS_READ } from "../config/texas/statute-sources.mjs";
import { ALL_UNITS } from "../config/texas/prins1-course-form.mjs";
import { COURSE, MODULES } from "../config/texas/principles-i-course.mjs";
import { TOPIC_QUIZZES, SCENARIOS } from "../config/texas/principles-i-question-bank.mjs";

/**
 * Citations that do not resolve to a read section and are nonetheless sound, because each is a
 * cross-reference contained in the read text of a register section and is presented in the
 * curriculum as unread. Anything added here needs the same justification discipline.
 */
export const EXPLAINED_CROSS_REFERENCES = Object.freeze({
  "53.254": "Cited only as the cross-reference inside the read text of Property Code § 41.001(b)(3); module-03 states expressly that § 53.254 itself was not read and leaves its content to counsel.",
  "50": "Texas Constitution article XVI, § 50 — cited only as the constitutional cross-reference the read text of § 41.001(b)(6)-(7) itself makes for home-equity loans and reverse mortgages.",
});

const READ_SET = new Set(SECTIONS_READ.map((entry) => entry.section));
const UNIT_CODES = new Set(ALL_UNITS.map((unit) => unit.code));
const TOPIC_CODES = new Set(ALL_UNITS.map((unit) => unit.topicCode));

/* GitHub-style heading slug: strip punctuation, then every space becomes a dash (not collapsed),
   so "Records, Recording & Acknowledgment" keeps the double dash the anchors use. */
const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s/g, "-");

/** Extract every §-cited section number from a module body, ranges expanded to their endpoints. */
export function citedSections(body) {
  const found = [];
  const pattern = /§§?\s*([0-9][0-9A-Za-z.]*(?:\([^)]*\))*(?:\s*[-–]\s*\.?[0-9][0-9A-Za-z.]*(?:\([^)]*\))*)?)/g;
  for (const match of body.matchAll(pattern)) {
    const bare = match[1].replace(/\([^)]*\)/g, "");
    let previous = null;
    for (let part of bare.split(/[-–]/)) {
      part = part.trim().replace(/\.$/, "").trim();
      if (!part) continue;
      if (part.startsWith(".") && previous) part = previous.split(".")[0] + part;
      found.push(part);
      previous = part;
    }
  }
  return found;
}

function checkModuleCitations(rootDir) {
  const failures = [];
  const crossReferencesSeen = new Set();
  for (const moduleEntry of MODULES) {
    const body = readFileSync(path.join(rootDir, COURSE.curriculumDir, moduleEntry.file), "utf8");
    for (const section of citedSections(body)) {
      if (READ_SET.has(section)) continue;
      if (EXPLAINED_CROSS_REFERENCES[section]) { crossReferencesSeen.add(section); continue; }
      failures.push(`${moduleEntry.file}: cites § ${section}, which is not in the read register`);
    }
  }
  return { failures, crossReferencesSeen };
}

/** A sentence asserting a $ or % figure as a legal requirement must cite a section in that sentence. */
function checkLegalFigures(rootDir) {
  const failures = [];
  const mandate = /\b(must|shall|may not|require[sd]?|prohibit[s]?|exempt[s]?ion?)\b/i;
  const lawWord = /\b(statute|Code|Act|law|section)\b|§/;
  for (const moduleEntry of MODULES) {
    const body = readFileSync(path.join(rootDir, COURSE.curriculumDir, moduleEntry.file), "utf8");
    const prose = body.replace(/\n+/g, " ");
    for (const sentence of prose.split(/(?<=[.!?])\s+/)) {
      if (!/[$%]|\bpercent\b/.test(sentence)) continue;
      if (!mandate.test(sentence) || !lawWord.test(sentence)) continue;
      if (/§/.test(sentence)) continue;
      failures.push(`${moduleEntry.file}: legal figure without citation: "${sentence.slice(0, 140)}…"`);
    }
  }
  return failures;
}

/** Option B for "The Benefits": the Texas curriculum teaches no federal tax benefit content. */
function checkTaxVocabulary(rootDir) {
  const banned = /\b(tax[- ]deducti|depreciat|capital[- ]gains?|1031|like[- ]kind exchange|passive[- ](activity )?loss|write[- ]off)/i;
  const failures = [];
  for (const moduleEntry of MODULES) {
    const body = readFileSync(path.join(rootDir, COURSE.curriculumDir, moduleEntry.file), "utf8");
    const match = body.match(banned);
    if (match) failures.push(`${moduleEntry.file}: tax-benefit vocabulary present ("${match[0]}")`);
  }
  return failures;
}

function checkAssessments(rootDir) {
  const failures = [];
  const headingsByFile = new Map();
  for (const moduleEntry of MODULES) {
    const body = readFileSync(path.join(rootDir, COURSE.curriculumDir, moduleEntry.file), "utf8");
    const slugs = new Set(
      [...body.matchAll(/^## Unit: (.+)$/gm)].map((m) => `unit-${slugify(m[1])}`),
    );
    headingsByFile.set(moduleEntry.file, slugs);
  }
  const checkItem = (topic, item) => {
    if (!UNIT_CODES.has(item.tests)) {
      failures.push(`${item.id}: tests unknown unit ${item.tests}`);
    } else if (!item.tests.startsWith(topic)) {
      failures.push(`${item.id}: tests ${item.tests}, outside its topic ${topic}`);
    }
    const [file, anchor] = String(item.remediation).split("#");
    const slugs = headingsByFile.get(file);
    if (!slugs) failures.push(`${item.id}: remediation names unknown file ${file}`);
    else if (!slugs.has(anchor)) failures.push(`${item.id}: remediation anchor ${anchor} not a unit heading in ${file}`);
  };
  for (const [topic, items] of Object.entries(TOPIC_QUIZZES)) {
    if (!TOPIC_CODES.has(topic)) failures.push(`quiz topic ${topic} is not a PRINS1-1 topic`);
    if (items.length < 3) failures.push(`topic ${topic}: only ${items.length} quiz items (minimum 3)`);
    for (const item of items) {
      checkItem(topic, item);
      if (!item.replacement || !item.replacement.rationale) failures.push(`${item.id}: no replacement question with rationale`);
    }
  }
  if (SCENARIOS.length < 3) failures.push(`only ${SCENARIOS.length} scenario exercises (minimum 3)`);
  for (const scenario of SCENARIOS) {
    if (!TOPIC_CODES.has(scenario.topicCode)) failures.push(`${scenario.id}: placed on unknown topic ${scenario.topicCode}`);
  }
  return failures;
}

export function claimTraceability(rootDir) {
  const citations = checkModuleCitations(rootDir);
  const failures = [
    ...citations.failures,
    ...checkLegalFigures(rootDir),
    ...checkTaxVocabulary(rootDir),
    ...checkAssessments(rootDir),
  ];
  return Object.freeze({
    gate: "TX_PRINCIPLES_I_CLAIM_TRACEABILITY",
    status: failures.length === 0 ? "PASS" : "FAIL",
    failures: Object.freeze(failures),
    explainedCrossReferences: Object.freeze([...citations.crossReferencesSeen].sort()),
    readSections: READ_SET.size,
  });
}

export default Object.freeze({ claimTraceability, citedSections, EXPLAINED_CROSS_REFERENCES });
